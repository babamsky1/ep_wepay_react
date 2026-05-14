import { Button } from "@/components/shared_components/button";
import { usePermissions } from "@/hooks/permission/usePermissions";
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Trash2,
  Check,
  XCircle,
  SendHorizonal,
  Download,
  X,
  RefreshCw,
  Save,
  History,
} from "lucide-react";

interface ActionButtonsProps {
  isEditing: boolean;
  isPending: boolean;
  isFinalized: boolean;
  isApproved: boolean;
  isReleased: boolean;
  isDisapproved: boolean;
  hasChanges: boolean;
  onBack: () => void;
  onFinalize: () => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onApprove: () => void;
  onDisapprove: () => void;
  onRelease: () => void;
  onPrintPdf: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onActionLog: () => void;
  onReopen: () => void;
}

export function ActionButtons({
  isEditing,
  isPending,
  isFinalized,
  isApproved,
  isReleased,
  isDisapproved,
  hasChanges,
  onBack,
  onFinalize,
  onStartEdit,
  onDelete,
  onApprove,
  onDisapprove,
  onRelease,
  onPrintPdf,
  onCancelEdit,
  onSave,
  onActionLog,
  onReopen,
}: ActionButtonsProps) {
  const {
    role,
    canModify,
    canFinalize,
    canDelete,
    canApprove,
    canDisapprove,
    canRelease,
    canSave,
  } = usePermissions();
  if (isEditing) {
    return (
      <>
        <Button
          variant="outline"
          onClick={onCancelEdit}
          className="min-w-[100px]"
        >
          <X className="h-4 w-4" /> Cancel
        </Button>

        {canSave && (
          <Button
            variant="default"
            onClick={onSave}
            disabled={!hasChanges}
            className="min-w-[100px] bg-green-800 hover:bg-green-700 text-white"
          >
            <Save className="h-4 w-4" /> Save
          </Button>
        )}
              </>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={onBack} className="min-w-[90px]">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      {isPending && (
        <>
          {canFinalize && (
            <Button
              variant="default"
              onClick={onFinalize}
              className="min-w-[110px]"
            >
              <CheckCircle2 className="h-4 w-4" /> Finalize
            </Button>
          )}
          {canModify && (role === "hr" || role === "superadmin") && (
            <Button
              variant="warning"
              onClick={onStartEdit}
              className="min-w-[110px]"
            >
              <Pencil className="h-4 w-4" /> Modify
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              className="min-w-[110px]"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </>
      )}

      {isFinalized && (
        <>
          {canApprove && (
            <Button
              variant="success"
              onClick={onApprove}
              className="min-w-[110px]"
            >
              <Check className="h-4 w-4" /> Approve
            </Button>
          )}
          {canDisapprove && (
            <Button
              variant="destructive"
              onClick={onDisapprove}
              className="min-w-[110px]"
            >
              <XCircle className="h-4 w-4" /> Disapprove
            </Button>
          )}
          {canModify && (role === "finance" || role === "superadmin") && (
            <Button
              variant="warning"
              onClick={onStartEdit}
              className="min-w-[110px]"
            >
              <Pencil className="h-4 w-4" /> Modify
            </Button>
          )}
        </>
      )}

      {isApproved && (
        <>
          {(role === "manager" || role === "superadmin") && (
            <Button
              variant="outline"
              onClick={onReopen}
              className="min-w-[110px]"
            >
              <RefreshCw className="h-4 w-4" /> Reopen
            </Button>
          )}
          {canRelease && (
            <Button
              variant="success"
              onClick={onRelease}
              className="min-w-[110px]"
            >
              <SendHorizonal className="h-4 w-4" /> Release
            </Button>
          )}
          <Button
            variant="default"
            onClick={onPrintPdf}
            className="min-w-[110px]"
          >
            <Download className="h-4 w-4" /> Print PDF
          </Button>
        </>
      )}

      {/* Action Log button - only visible to SUPERADMIN, MANAGER, and FINANCE */}
      {["superadmin", "manager", "finance"].includes(role || "") && (
        <Button
          variant="secondary"
          onClick={onActionLog}
          className="min-w-[110px]"
        >
          <History className="h-4 w-4" /> Action Log
        </Button>
      )}

      {(isReleased || isDisapproved) && (
        <Button
          variant="default"
          onClick={onPrintPdf}
          className="min-w-[110px]"
        >
          <Download className="h-4 w-4" /> Print PDF
        </Button>
      )}
    </>
  );
}
