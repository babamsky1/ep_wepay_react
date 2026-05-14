import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import {
  AdditionalsType,
  LastPayRecord,
  QuitClaimStatus,
} from "@/types/lastPayTypes";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";

// ---- Types ----

type UpdateStatusResult = "updated" | "conflict";

type Dialog = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: "destructive" | "success";
};

interface Props {
  data: LastPayRecord | null;
  ref_no: string;
  navigate: (path: string) => void;
}

interface LocalState {
  payables: AdditionalsType[] | null;
  deductions: AdditionalsType[] | null;
  status: QuitClaimStatus | null;
  disapproveRemark: string | null;
}

interface Modals {
  disapprove: boolean;
  print: boolean;
}

// ---- Constants ----

const CLOSED_DIALOG: Dialog = {
  isOpen: false,
  title: "",
  message: "",
  onConfirm: () => {},
};

const CONFLICT_MSG = {
  generic:
    "Record was modified by another user. Refreshed with latest data — no changes made.",
  lineItems:
    "Cannot proceed: unsaved line item changes exist. Please save first.",
  deleteAborted:
    "Delete aborted: this record was modified by another user. Please review the latest data before deleting.",
};

// ---- Helpers ----

// Checks if an error came from a version conflict on the server.
function isConflictError(
  err: unknown,
): err is { isConflict: true; conflictType?: string } {
  return (
    err !== null &&
    typeof err === "object" &&
    "isConflict" in err &&
    (err as { isConflict: boolean }).isConflict === true
  );
}

function getPayables(record: LastPayRecord | null | undefined) {
  return record?.payables ?? [];
}

function getDeductions(record: LastPayRecord | null | undefined) {
  return record?.deductions ?? [];
}

// New items don't have an ad_type_id yet, so we generate a temp key by index.
function itemKey(item: AdditionalsType, index: number): string {
  return item.ad_type_id ? item.ad_type_id : `new-${index}`;
}

// Returns true if the local list differs from the original list.
function hasLineItemChanges(
  local: AdditionalsType[],
  original: AdditionalsType[] = [],
): boolean {
  if (local.length !== original.length) return true;

  const originalByKey = new Map(
    original.map((item, i) => [itemKey(item, i), item]),
  );

  return local.some((item, i) => {
    const orig = originalByKey.get(itemKey(item, i));
    if (!orig) return true;
    return (
      item.amount !== orig.amount ||
      item.description !== orig.description ||
      item.is_confidential !== orig.is_confidential
    );
  });
}

// HR/Finance shouldn't see a manager's confidential items. Superadmin sees all.
function filterByRole(items: AdditionalsType[], role: string) {
  if (role === "superadmin") return items;
  return items.filter((item) => {
    const isManagerConfidential =
      item.created_by_role === 4 && item.is_confidential === "Y";
    if (isManagerConfidential) return role === "manager";
    return true;
  });
}

// Checks if the server record differs from what we expected (role-aware).
function hasConflict(
  current: LastPayRecord,
  expected: LastPayRecord,
  role: string,
): boolean {
  const currentPayables = filterByRole(getPayables(current), role);
  const expectedPayables = filterByRole(getPayables(expected), role);
  const currentDeductions = filterByRole(getDeductions(current), role);
  const expectedDeductions = filterByRole(getDeductions(expected), role);

  return (
    hasLineItemChanges(currentPayables, expectedPayables) ||
    hasLineItemChanges(currentDeductions, expectedDeductions) ||
    current.lp_status !== expected.lp_status
  );
}

function showToast(msg: string, type: "success" | "error" = "success") {
  if (type === "success") toast.success(msg);
  else toast.error(msg);
}

// ---- Hook ----

export function useQuitClaimActions({ data, ref_no, navigate }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const actorName = user?.name ?? "unknown";
  const role = user?.role ?? "";

  // ---- State ----

  const [dialog, setDialog] = useState<Dialog>(CLOSED_DIALOG);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localState, setLocalState] = useState<LocalState>({
    payables: null,
    deductions: null,
    status: null,
    disapproveRemark: null,
  });
  const [modals, setModals] = useState<Modals>({
    disapprove: false,
    print: false,
  });

  // Always-fresh copy of localState, used inside async callbacks to avoid
  // stale closures.
  const localStateRef = useRef(localState);

  // Snapshot of `data` taken when edit mode starts. Conflict checks compare
  // against this so the comparison is stable even if `data` prop changes.
  const editSnapshotRef = useRef<LastPayRecord | null>(null);

  // Prevents two save/update operations from running at the same time.
  const isMutatingRef = useRef(false);

  // Updates state and keeps the ref in sync.
  const updateLocalState = useCallback(
    (updater: (prev: LocalState) => LocalState) => {
      setLocalState((prev) => {
        const next = updater(prev);
        localStateRef.current = next;
        return next;
      });
    },
    [],
  );

  const closeDialog = useCallback(() => setDialog(CLOSED_DIALOG), []);

  // ---- Cache helpers ----

  // Updates the single-record cache and the list cache.
  const updateCache = useCallback(
    (record: LastPayRecord) => {
      queryClient.setQueryData(["record", record.ref_no], record);
      queryClient.setQueryData(
        ["allRecords"],
        (old: LastPayRecord[] | undefined) =>
          old?.map((r) => (r.ref_no === record.ref_no ? record : r)),
      );
    },
    [queryClient],
  );

  // Updates cache + local state from a server record.
  const syncCacheAndState = useCallback(
    (
      record: LastPayRecord,
      options?: { nullifyLineItems?: boolean; exitEditMode?: boolean },
    ) => {
      updateCache(record);
      updateLocalState((prev) => ({
        ...prev,
        status: record.lp_status,
        disapproveRemark: record.disapprove_remark ?? null,
        payables: options?.nullifyLineItems ? null : getPayables(record),
        deductions: options?.nullifyLineItems ? null : getDeductions(record),
      }));
      if (options?.exitEditMode) setIsEditing(false);
    },
    [updateCache, updateLocalState],
  );

  // Removes a record from both caches.
  const removeFromCache = useCallback(
    (referenceNo: string) => {
      queryClient.removeQueries({ queryKey: ["record", referenceNo] });
      queryClient.setQueryData(
        ["allRecords"],
        (old: LastPayRecord[] | undefined) =>
          old?.filter((r) => r.ref_no !== referenceNo),
      );
      queryClient.invalidateQueries({ queryKey: ["allRecords"] });
    },
    [queryClient],
  );

  // ---- Server helpers ----

  const fetchFreshRecord = useCallback(async (referenceNo: string) => {
    const res = await api.lastPayRecords.getByRef(referenceNo);
    if (!res.data) throw new Error("Record not found");
    return res.data;
  }, []);

  // Reloads the record from the server and clears any local edits.
  const refreshFromServer = useCallback(
    async (referenceNo: string) => {
      const fresh = await fetchFreshRecord(referenceNo);
      updateCache(fresh);
      updateLocalState((prev) => ({
        ...prev,
        status: fresh.lp_status,
        disapproveRemark: fresh.disapprove_remark ?? null,
        payables: null,
        deductions: null,
      }));
      return fresh;
    },
    [fetchFreshRecord, updateCache, updateLocalState],
  );

  // Shows the right toast for an error from a status update.
  const handleConflictError = useCallback(
    async (err: unknown, failTitle: string) => {
      if (!isConflictError(err)) {
        showToast(`${failTitle}. Please try again.`, "error");
        return;
      }

      if (err.conflictType === "lineItems") {
        toast.error(CONFLICT_MSG.lineItems);
        return;
      }

      if (!data) {
        showToast(`${failTitle}. Please try again.`, "error");
        return;
      }

      try {
        await refreshFromServer(data.ref_no);
        showToast(CONFLICT_MSG.generic);
      } catch {
        showToast(`${failTitle}. Please try again.`, "error");
      }
    },
    [data, refreshFromServer],
  );

  // ---- Status update ----

  // Updates the record's status. Checks the server first to make sure
  // nobody else changed it in the meantime.
  const updateStatus = useCallback(
    async (
      status: QuitClaimStatus,
      remark?: string,
    ): Promise<UpdateStatusResult> => {
      if (isMutatingRef.current) {
        toast.error("Another operation is in progress. Please wait.");
        throw new Error("Concurrent mutation blocked");
      }

      isMutatingRef.current = true;

      try {
        if (!data) return "conflict";

        setIsLoading(true);
        setError(null);

        // Make sure the status hasn't changed since we last saw it.
        const current = await fetchFreshRecord(data.ref_no);
        const expectedStatus = localStateRef.current.status ?? data.lp_status;

        if (current.lp_status !== expectedStatus) {
          syncCacheAndState(current);
          return "conflict";
        }

        await api.quitClaimActions.updateStatus(
          data.last_pay_record_id,
          status,
          remark,
          actorName,
        );

        const fresh = await fetchFreshRecord(data.ref_no);
        syncCacheAndState(fresh);

        return "updated";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
        throw err;
      } finally {
        setIsLoading(false);
        isMutatingRef.current = false;
      }
    },
    [data, actorName, fetchFreshRecord, syncCacheAndState],
  );

  // ---- Edit mode ----

  const hasChanges = useMemo(() => {
    if (!data || !localState.payables || !localState.deductions) return false;
    return (
      hasLineItemChanges(localState.payables, getPayables(data)) ||
      hasLineItemChanges(localState.deductions, getDeductions(data))
    );
  }, [localState.payables, localState.deductions, data]);

  const startEdit = useCallback(() => {
    if (!data) return;

    // Snapshot the record now so later conflict checks compare against this
    // fixed reference, not whatever `data` happens to be.
    editSnapshotRef.current = data;

    updateLocalState((prev) => ({
      ...prev,
      payables: [...getPayables(data)],
      deductions: [...getDeductions(data)],
    }));
    setIsEditing(true);
  }, [data, updateLocalState]);

  const cancelEdit = useCallback(() => {
    editSnapshotRef.current = null;
    updateLocalState((prev) => ({
      ...prev,
      payables: null,
      deductions: null,
    }));
    setIsEditing(false);
  }, [updateLocalState]);

  // ---- Saving line items ----

  // Syncs one group of items (payables OR deductions) with the server:
  // creates new ones, updates changed ones, and deletes missing ones.
  const syncItems = useCallback(
    async (
      local: AdditionalsType[],
      original: AdditionalsType[],
      type: "P" | "D",
    ) => {
      if (!data) return;

      const timestamp = new Date().toISOString();
      const originalById = new Map(original.map((i) => [i.ad_type_id, i]));
      const localIds = new Set(local.map((i) => i.ad_type_id));

      // Items that exist in original but not in local → delete.
      const deletes = original
        .filter((o) => o.ad_type_id && !localIds.has(o.ad_type_id))
        .map((o) => api.additionalsType.delete(o.ad_type_id, actorName));

      // For each local item: create if new, update if changed, skip if same.
      const upserts = local.flatMap((item) => {
        const existing = item.ad_type_id
          ? originalById.get(item.ad_type_id)
          : undefined;

        const base = {
          ad_type_id: item.ad_type_id,
          last_pay_record_id: data.last_pay_record_id,
          addtl_type: type,
          description: item.description,
          amount: item.amount,
          is_confidential: item.is_confidential,
          created_by_role: item.created_by_role,
        };

        // New item.
        if (!existing) {
          return [
            api.additionalsType.create({
              ...base,
              created_at: timestamp,
              created_by: actorName,
              updated_at: timestamp,
              updated_by: actorName,
            }),
          ];
        }

        // Existing item — only update if something actually changed.
        const isDirty =
          existing.description !== item.description ||
          existing.amount !== item.amount ||
          existing.is_confidential !== item.is_confidential;

        if (!isDirty) return [];

        return [
          api.additionalsType.update({
            ...base,
            created_at: item.created_at,
            created_by: item.created_by,
            updated_at: timestamp,
            updated_by: actorName,
          }),
        ];
      });

      // Use allSettled so a single failed op doesn't cancel the rest.
      // Collect all failures and surface them as one error.
      const results = await Promise.allSettled([...deletes, ...upserts]);
      const failures = results.filter(
        (r): r is PromiseRejectedResult => r.status === "rejected",
      );

      if (failures.length > 0) {
        const reasons = failures
          .map((f) => f.reason?.message ?? "Unknown error")
          .join(", ");
        throw new Error(`${failures.length} operation(s) failed: ${reasons}`);
      }
    },
    [data, actorName],
  );

  // ---- Save ----

  const save = useCallback(() => {
    if (!data) return;

    setDialog({
      isOpen: true,
      title: "Save Changes",
      message: "Are you sure you want to save your modifications?",
      variant: "success",
      onConfirm: async () => {
        const { payables, deductions } = localStateRef.current;
        if (!payables || !deductions) return;

        // Compare against the edit-start snapshot, not the current `data` prop.
        const snapshot = editSnapshotRef.current ?? data;

        try {
          setIsLoading(true);

          // Make sure no one else changed the record while we were editing.
          const current = await fetchFreshRecord(data.ref_no);
          if (hasConflict(current, snapshot, role)) {
            await refreshFromServer(data.ref_no);
            editSnapshotRef.current = null;
            setIsEditing(false);
            closeDialog();
            showToast(CONFLICT_MSG.generic);
            return;
          }

          // Sync payables and deductions in parallel.
          const results = await Promise.allSettled([
            syncItems(payables, getPayables(snapshot), "P"),
            syncItems(deductions, getDeductions(snapshot), "D"),
          ]);

          const failures = results.filter(
            (r): r is PromiseRejectedResult => r.status === "rejected",
          );
          if (failures.length > 0) {
            const reasons = failures
              .map((f) => f.reason?.message ?? "Unknown error")
              .join(", ");
            throw new Error(
              `Failed to sync ${failures.length} line item group(s): ${reasons}`,
            );
          }

          // Re-fetch so the cache has the authoritative server state
          // (server may assign IDs to newly created items, etc).
          const fresh = await fetchFreshRecord(data.ref_no);
          updateCache(fresh);
          updateLocalState((prev) => ({
            ...prev,
            payables: null,
            deductions: null,
          }));
          editSnapshotRef.current = null;
          setIsEditing(false);
          closeDialog();
          showToast(`Record ${data.ref_no} saved successfully.`);
        } catch (err) {
          closeDialog();
          showToast(
            err instanceof Error ? err.message : "Failed to save changes.",
            "error",
          );
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [
    data,
    role,
    syncItems,
    updateCache,
    closeDialog,
    fetchFreshRecord,
    refreshFromServer,
    updateLocalState,
  ]);

  // ---- Status actions (finalize, approve, release) ----

  // Generic helper for "confirm dialog → updateStatus → toast" flow.
  const openStatusDialog = useCallback(
    (
      status: QuitClaimStatus,
      title: string,
      message: string,
      successMsg: string,
      failTitle: string,
    ) => {
      if (!data) return;

      setDialog({
        isOpen: true,
        title,
        message,
        variant: "success",
        onConfirm: async () => {
          try {
            const result = await updateStatus(status);
            closeDialog();
            showToast(
              result === "updated" ? successMsg : CONFLICT_MSG.generic,
            );
          } catch (err) {
            closeDialog();
            handleConflictError(err, failTitle);
          }
        },
      });
    },
    [data, updateStatus, closeDialog, handleConflictError],
  );

  const finalize = useCallback(
    () =>
      openStatusDialog(
        "FINALIZED",
        "Finalize Quit Claim",
        `Finalize quit claim for ${data?.emp_id ?? ""}`,
        `Quit claim for ${data?.emp_id ?? ""} has been finalized.`,
        "Finalize Failed. Try refreshing the page. ",
      ),
    [openStatusDialog, data?.emp_id],
  );

  const approve = useCallback(
    () =>
      openStatusDialog(
        "APPROVED",
        "Approve Quit Claim",
        `Approve quit claim for ${data?.emp_id ?? ""}`,
        `Quit claim for ${data?.emp_id ?? ""} has been approved.`,
        "Approve Failed",
      ),
    [openStatusDialog, data?.emp_id],
  );

  const release = useCallback(
    () =>
      openStatusDialog(
        "RELEASED",
        "Release Quit Claim",
        `Release quit claim for ${data?.emp_id ?? ""}?`,
        `Quit claim for ${data?.emp_id ?? ""} has been released.`,
        "Release Failed",
      ),
    [openStatusDialog, data?.emp_id],
  );

  // ---- Disapprove (uses its own modal, not the generic dialog) ----

  const disapprove = useCallback(
    () => setModals((prev) => ({ ...prev, disapprove: true })),
    [],
  );

  const cancelDisapprove = useCallback(
    () => setModals((prev) => ({ ...prev, disapprove: false })),
    [],
  );

  const confirmDisapprove = useCallback(
    async (remark: string) => {
      if (!data) return;
      try {
        const result = await updateStatus("DISAPPROVED", remark);
        setModals((prev) => ({ ...prev, disapprove: false }));
        showToast(
          result === "updated"
            ? `Quit claim for ${data.emp_id} has been disapproved.`
            : CONFLICT_MSG.generic,
        );
      } catch (err) {
        setModals((prev) => ({ ...prev, disapprove: false }));
        handleConflictError(err, "Disapprove Failed");
      }
    },
    [data, updateStatus, handleConflictError],
  );

  // ---- Delete ----

  const deleteRecord = useCallback(() => {
    if (!data) {
      toast.error("Cannot delete: record data is unavailable.");
      return;
    }

    const currentStatus = localStateRef.current.status ?? data.lp_status;
    if (currentStatus !== "PENDING") {
      toast.error("Quit claim can only be deleted if it's in PENDING status.");
      return;
    }

    setDialog({
      isOpen: true,
      title: "Delete Record",
      message: `Delete record "${ref_no}"? This cannot be undone.`,
      onConfirm: async () => {
        // Use edit snapshot if we're mid-edit, otherwise the current data.
        const snapshot = editSnapshotRef.current ?? data;

        try {
          setIsLoading(true);

          const current = await fetchFreshRecord(data.ref_no);
          if (hasConflict(current, snapshot, role)) {
            await refreshFromServer(data.ref_no);
            setIsEditing(false);
            closeDialog();
            toast.error(CONFLICT_MSG.deleteAborted);
            return;
          }

          await api.lastPayRecords.delete(data.last_pay_record_id, actorName);
          closeDialog();
          removeFromCache(data.ref_no);
          navigate("/lastpay");
          showToast(`Record ${ref_no} deleted.`);
        } catch {
          closeDialog();
          showToast("Delete Failed.", "error");
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [
    ref_no,
    navigate,
    removeFromCache,
    closeDialog,
    data,
    role,
    fetchFreshRecord,
    refreshFromServer,
    actorName,
  ]);

  // ---- Reopen ----

  // Sends a FINALIZED record back to PENDING so HR/Finance can edit it again.
  const reopen = useCallback(() => {
    if (!data) return;

    setDialog({
      isOpen: true,
      title: "Reopen Quit Claim",
      message: `Reopen quit claim for ${data.emp_id}? This will reset the status to PENDING and allow HR and Finance to modify and finalize again.`,
      variant: "success",
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await api.quitClaimActions.reopen(data.last_pay_record_id, actorName);
          const fresh = await fetchFreshRecord(data.ref_no);
          syncCacheAndState(fresh, { exitEditMode: true });
          closeDialog();
          showToast(`Quit claim for ${data.emp_id} has been reopened.`);
        } catch (err) {
          closeDialog();
          handleConflictError(err, "Reopen Failed");
        } finally {
          setIsLoading(false);
        }
      },
    });
  }, [
    data,
    actorName,
    syncCacheAndState,
    closeDialog,
    handleConflictError,
    fetchFreshRecord,
  ]);

  // ---- Print ----

  const printPdf = useCallback(
    () => setModals((prev) => ({ ...prev, print: true })),
    [],
  );

  // ---- Local state setters ----

  const setLocalPayables = useCallback(
    (payables: AdditionalsType[] | null) =>
      updateLocalState((prev) => ({ ...prev, payables })),
    [updateLocalState],
  );

  const setLocalDeductions = useCallback(
    (deductions: AdditionalsType[] | null) =>
      updateLocalState((prev) => ({ ...prev, deductions })),
    [updateLocalState],
  );

  const setLocalDisapproveRemark = useCallback(
    (disapproveRemark: string | null) =>
      updateLocalState((prev) => ({ ...prev, disapproveRemark })),
    [updateLocalState],
  );

  const setIsPrintModalOpen = useCallback(
    (open: boolean) => setModals((prev) => ({ ...prev, print: open })),
    [],
  );

  // ---- Public API ----

  return {
    dialog,
    closeDialog,
    isEditing,
    isDisapproveModalOpen: modals.disapprove,
    isPrintModalOpen: modals.print,
    localStatus: localState.status,
    localDisapproveRemark: localState.disapproveRemark,
    localPayables: localState.payables,
    localDeductions: localState.deductions,
    hasChanges,
    isLoading,
    error,
    setLocalPayables,
    setLocalDeductions,
    setLocalDisapproveRemark,
    setIsPrintModalOpen,
    handleStartEdit: startEdit,
    handleCancelEdit: cancelEdit,
    handleSave: save,
    handleFinalize: finalize,
    handleApprove: approve,
    handleRelease: release,
    handleDisapprove: disapprove,
    handleCancelDisapprove: cancelDisapprove,
    handleConfirmDisapprove: confirmDisapprove,
    handleDelete: deleteRecord,
    handleReopen: reopen,
    handlePrintPdf: printPdf,
  } as const;
}