import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/permission/usePermissions";
import { AdditionalsType } from "@/types/lastPayTypes";
import { useMemo, useState, useEffect, useCallback } from "react";
import { getTimestamp } from "@/helpers/dateUtils";

const ROLE_IDS: Record<string, number> = {
  superadmin: 1,
  finance: 2,
  hr: 3,
  manager: 4,
};

// Types
interface UseLineItemsProps {
  items: AdditionalsType[];
  type: "P" | "D";
  last_pay_record_id: string;
  onItemsChange?: (items: AdditionalsType[]) => void;
  isEditing?: boolean;
}

// Hook
export function useLineItems({
  items,
  type,
  last_pay_record_id,
  onItemsChange,
  isEditing = false,
}: UseLineItemsProps) {
  const { user } = useAuth();
  const { canSetConfidential, canEditItem: canEditItemPerm, canToggleConfidential: canToggleConfidentialPerm, canViewItem, role } = usePermissions();
  const isDeduction = type === "D";

  const getCurrentUser = useCallback(
    () => user?.name || "system",
    [user?.name],
  );

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    label: "",
    amount: "",
    is_confidential: false,
  });

  // Reset editing state when isEditing becomes false.
  useEffect(() => {
    if (!isEditing && (showForm || editingId !== null)) {
      setEditingId(null);
      setShowForm(false);
      setForm({ label: "", amount: "", is_confidential: false });
    }
  }, [isEditing]);

  const isValid = useMemo(
    () =>
      (form.label || "").trim().length > 0 &&
      !isNaN(Number(form.amount)) &&
      Number(form.amount) > 0 &&
      /^[a-zA-Z]/.test((form.label || "").trim()),
    [form.label, form.amount],
  );

  const canEditItem = useCallback(
    (item: AdditionalsType): boolean => canEditItemPerm(item, getCurrentUser()),
    [canEditItemPerm, getCurrentUser],
  );

  // Filter items based on role visibility rules, then sort most-recent first.
  const visibleItems = useMemo(() => {
    const filtered = items.filter(canViewItem);

    return [...filtered].sort((a, b) => {
      const dateA = new Date(
        a.updated_at || a.created_at || Date.now(),
      ).getTime();
      const dateB = new Date(
        b.updated_at || b.created_at || Date.now(),
      ).getTime();
      return dateB - dateA;
    });
  }, [items, role]);

  const resetForm = useCallback(() => {
    setForm({ label: "", amount: "", is_confidential: false });
    setEditingId(null);
    setShowForm(false);
  }, []);

  const saveItem = useCallback(() => {
    if (!isValid) {
      const trimmedLabel = form.label.trim();
      if (trimmedLabel.length === 0) {
        toast.error("Invalid Input: Please provide a label.");
      } else if (/^[0-9]/.test(trimmedLabel)) {
        toast.error("Invalid Input: Label must start with a letter.");
      } else {
        toast.error("Invalid Input: Please provide a valid label and amount.");
      }
      return;
    }

    const label = form.label.trim();
      const amount = Number(form.amount);
    if (!isFinite(amount) || amount <= 0) {
      toast.error("Invalid Input: Please provide a valid amount.");
      return;
    }

    const now = getTimestamp();
    const currentUser = getCurrentUser();

    if (editingId !== null) {
      // Look up by stable ID, not by a positional index that may have
      // shifted due to filtering/sorting in visibleItems.
      onItemsChange?.(
        items.map((item) =>
          item.ad_type_id === editingId
            ? {
                ...item,
                description: label,
                amount,
                is_confidential: canSetConfidential
                  ? form.is_confidential
                    ? "Y"
                    : "N"
                  : item.is_confidential,
                updated_by: currentUser,
              }
            : item,
        ),
      );
      toast.success(`Item Updated: ${label}`);
    } else {
      onItemsChange?.([
        {
          ad_type_id: "",
          last_pay_record_id,
          addtl_type: type,
          description: label,
          amount,
          is_confidential: canSetConfidential
            ? form.is_confidential
              ? "Y"
              : "N"
            : "N",
          created_by_role: ROLE_IDS[role || ""] ?? null,
          created_by: currentUser,
          created_at: now,
          updated_by: currentUser,
          updated_at: now,
        },
        ...items,
      ]);
      toast.success(
        `Item Added: ${label} added to ${isDeduction ? "deductions" : "payables"}.`,
      );
    }

    resetForm();
  }, [
    isValid,
    form,
    editingId,
    items,
    onItemsChange,
    canSetConfidential,
    getCurrentUser,
    last_pay_record_id,
    type,
    role,
    isDeduction,
    resetForm,
  ]);

  // use for editing OWN line item (depends on the roles)
  const startEdit = useCallback(
    (item: AdditionalsType) => {
      if (!canEditItem(item)) {
        toast.error("You do not have permission to edit this item.");
        return;
      }
      setEditingId(item.ad_type_id);
      setForm({
        label: item.description || "",
        amount: String(item.amount),
        is_confidential: item.is_confidential === "Y",
      });
      setShowForm(true);
    },
    [canEditItem],
  );

  const deleteItem = useCallback(
    (item: AdditionalsType) => {
      if (!canEditItem(item)) {
        toast.error("You do not have permission to delete this item.");
        return;
      }
      onItemsChange?.(
        items.filter((it) => it !== item && it.ad_type_id !== item.ad_type_id),
      );
      toast.error(`Item Deleted: ${item.description}`);
    },
    [canEditItem, items, onItemsChange],
  );

  // use for making the line item to make it confidential or non-confidential
  const toggleConfidential = useCallback(
    (item: AdditionalsType) => {
      if (!canToggleConfidentialPerm(item, getCurrentUser())) {
        toast.error("You do not have permission to change confidentiality.");
        return;
      }

      onItemsChange?.(
        items.map((it) =>
          it === item || (it.ad_type_id && it.ad_type_id === item.ad_type_id)
            ? { ...it, is_confidential: it.is_confidential === "Y" ? "N" : "Y" }
            : it,
        ),
      );
    },
    [canToggleConfidentialPerm, getCurrentUser, items, onItemsChange],
  );

  return {
    role,
    showForm,
    setShowForm,
    editingId,
    form,
    setForm,
    isValid,
    resetForm,
    saveItem,
    startEdit,
    deleteItem,
    toggleConfidential,
    visibleItems,
    canEditItem,
  };
}
