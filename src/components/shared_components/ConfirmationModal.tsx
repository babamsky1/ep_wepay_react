import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/shared_components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shared_components/dialog";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  variant?: 'destructive' | 'success';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  variant = 'destructive',
  isLoading = false,
}: ConfirmationModalProps) {
  const isSuccess = variant === 'success';
  const Icon = isSuccess ? CheckCircle2 : AlertTriangle;
  const iconBgColor = isSuccess ? 'bg-green-100' : 'bg-destructive/10';
  const iconColor = isSuccess ? 'text-green-600' : 'text-destructive';
  const confirmVariant = isSuccess ? 'default' : 'destructive';

  const handleOpenChange = (open: boolean) => {
    // ✅ Never allow dismissal while an async operation is in flight
    if (isLoading) return;
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        // ✅ Also block the default close button (the X) while loading
        onPointerDownOutside={(e) => isLoading && e.preventDefault()}
        onEscapeKeyDown={(e) => isLoading && e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>
            <div>
              <DialogTitle className="text-lg">{title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-base mt-2">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {isSuccess ? 'Processing...' : 'Deleting...'}
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}