import { useNavigate, useParams } from "react-router-dom";
import { useState, memo } from "react";
import { ConfirmationModal } from "@/components/shared_components/ConfirmationModal";
import { DisapproveModal } from "@/components/shared_components/DisapproveModal";
import PrintPdf from "@/components/shared_components/PrintPdf";
import { StatusBadge } from "@/components/shared_components/StatusBadge";
import { LoadingState } from "@/components/shared_components/LoadingState";
import { ErrorState } from "@/components/shared_components/ErrorState";
import { useSingleRecord } from "@/hooks/data_fetching/quit-claim/useLastPayRecords";
import { useQuitClaimActions } from "@/hooks/last_pay/useQuitClaimActions";
import { LineItemSection } from "./components/LineItemSection";
import { QuitClaimSummary } from "./components/QuitClaimSummary";
import { ActionButtons } from "./components/ActionButtons";
import { useLastPayActionLog } from "@/hooks/action_log/useActionLog";
import { ActionLogTable } from "@/components/shared_components/ActionLogTable";
import { LastPayProvider } from "@/contexts/LastPayContext";
import { LastPayRecord } from "@/types/lastPayTypes";

// ─── Main view (record already loaded) ───────────────────────────────────────

const RecordDetailLoaded = memo(({
  recordData,
  ref_no,
}: {
  recordData: LastPayRecord;
  ref_no?: string;
}) => {
  const navigate = useNavigate();

  // Get live data from React Query cache
  const { data: liveRecordData } = useSingleRecord(recordData.ref_no);

  // Use live data from React Query cache, fallback to original recordData
  const currentRecord = liveRecordData || recordData;

  // All actions (save, approve, finalize, etc.) come from one hook
  const {
    dialog,
    closeDialog,
    isEditing,
    hasChanges,
    isLoading,
    isDisapproveModalOpen,
    isPrintModalOpen,
    setIsPrintModalOpen,
    localDisapproveRemark,
    localPayables,
    setLocalPayables,
    localDeductions,
    setLocalDeductions,
    localStatus,
    handleSave,
    handleCancelEdit,
    handleStartEdit,
    handleFinalize,
    handleApprove,
    handleRelease,
    handleDisapprove,
    handleConfirmDisapprove,
    handleCancelDisapprove,
    handleDelete,
    handleReopen,
    handlePrintPdf,
  } = useQuitClaimActions({
    data: currentRecord,
    ref_no: ref_no ?? "",
    navigate,
  });

  const payables = localPayables ?? currentRecord.payables;
  const deductions = localDeductions ?? currentRecord.deductions;
  const status = localStatus ?? currentRecord.lp_status;
  const [isActionLogModalOpen, setIsActionLogModalOpen] = useState(false);
  const { actionLogEntries, formatDateTime } = useLastPayActionLog();

  const isPending = status === "PENDING";
  const isFinalized = status === "FINALIZED";
  const isApproved = status === "APPROVED";
  const isReleased = status === "RELEASED";
  const isDisapproved = status === "DISAPPROVED";

  // Helper: build props for a payable (P) or deduction (D) section
  const lineItemProps = (type: "P" | "D") => ({
    type,
    items: (type === "P" ? payables : deductions) ?? [],
    isEditing,
    ref_no: currentRecord.ref_no,
    onItemsChange: type === "P" ? setLocalPayables : setLocalDeductions,
  });

  return (
    <LastPayProvider
      record={currentRecord}
      activePayables={payables}
      activeDeductions={deductions}
      disapproveRemark={
        localDisapproveRemark ?? currentRecord.disapprove_remark ?? null
      }
    >
      <div className="flex flex-col p-3 lg:p-4">
        {/* ── Header: title + status badge + action buttons ── */}
        <div className="flex flex-col lg:flex-row lg:justify-between items-center gap-4 pb-2 px-4 lg:px-20">
          <div className="text-center lg:text-left">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight flex items-center gap-2">
              {currentRecord.ref_no} - {currentRecord.emp_name}
              {status && <StatusBadge value={status} />}
            </h1>
            <span className="text-sm text-gray-500">
              {currentRecord.employee_start_date} to {currentRecord.employee_end_date}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
            <ActionButtons
              isEditing={isEditing}
              isPending={isPending}
              isFinalized={isFinalized}
              isApproved={isApproved}
              isReleased={isReleased}
              isDisapproved={isDisapproved}
              hasChanges={hasChanges}
              onBack={() => navigate("/lastpay")}
              onFinalize={handleFinalize}
              onStartEdit={handleStartEdit}
              onDelete={handleDelete}
              onApprove={handleApprove}
              onDisapprove={handleDisapprove}
              onRelease={handleRelease}
              onPrintPdf={handlePrintPdf}
              onCancelEdit={handleCancelEdit}
              onSave={handleSave}
              onActionLog={() => setIsActionLogModalOpen(true)}
              onReopen={handleReopen}
            />
          </div>
        </div>

        {/* Desktop: 3-column grid */}
        <div className="grid lg:grid-cols-3 gap-6 px-20 mt-2">
          <QuitClaimSummary />
          <LineItemSection {...lineItemProps("P")} />
          <LineItemSection {...lineItemProps("D")} />
        </div>

        {/* ── Modals ── */}
        <ConfirmationModal
          isOpen={dialog.isOpen}
          onClose={closeDialog}
          title={dialog.title}
          message={dialog.message}
          onConfirm={dialog.onConfirm}
          variant={dialog.variant}
          isLoading={isLoading}
        />

        <DisapproveModal
          isOpen={isDisapproveModalOpen}
          onClose={handleCancelDisapprove}
          onConfirm={handleConfirmDisapprove}
          emp_name={currentRecord.emp_name}
        />

        <PrintPdf
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          data={currentRecord}
          currentStatus={status}
        />

        <ActionLogTable
          isOpen={isActionLogModalOpen}
          onClose={() => setIsActionLogModalOpen(false)}
          actionLogEntries={actionLogEntries}
          formatDateTime={formatDateTime}
        />
      </div>
    </LastPayProvider>
  );
});

// ─── Route entry point ────────────────────────────────────────────────────────

const RecordDetail = () => {
  const { ref_no } = useParams<{ ref_no?: string }>();

  const {
    data: recordData,
    isLoading,
    isError,
    error,
  } = useSingleRecord(ref_no ?? "");

  if (isLoading) {
    return <LoadingState message="Loading quit claim details..." />;
  }

  if (isError) {
    return <ErrorState message={error?.message || "Please try again later"} showBackButton={true} />;
  }

  if (!recordData) {
    return (
      <div className="p-4 lg:p-10 text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Record Not Found</h1>
        <p className="text-muted-foreground mb-6">
          No record found for reference ID "{ref_no}".
        </p>
      </div>
    );
  }

  return (
    <LastPayProvider
      record={recordData}
      activePayables={recordData.payables}
      activeDeductions={recordData.deductions}
      disapproveRemark={recordData.disapprove_remark ?? null}
    >
      <RecordDetailLoaded recordData={recordData} ref_no={ref_no} />
    </LastPayProvider>
  );
};

export default RecordDetail;

