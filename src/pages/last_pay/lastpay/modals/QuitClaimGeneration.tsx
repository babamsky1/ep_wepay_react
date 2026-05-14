import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shared_components/dialog";
import { Button } from "@/components/shared_components/button";
import { EmployeeDetails } from "@/components/shared_components/EmployeeDetails";
import { Search, X } from "lucide-react";
import { EmployeeSearchDialog } from "./EmployeeSearchDialog";
import { useGeneration } from "@/hooks/last_pay/useGeneration";

interface QuitClaimGenerationProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated?: (ref_no: string) => void;
}

export function QuitClaimGeneration({
  isOpen,
  onClose,
  onGenerated,
}: QuitClaimGenerationProps) {
  const {
    selectedEmployee,
    showEmployeeSearch,
    isGenerating,
    handleClose,
    handleSelectEmployee,
    handleGenerateQuitClaim,
    handleClear,
    handleEmployeeSearchClick,
    handleEmployeeSearchClose,
  } = useGeneration({ onClose, onGenerated });

  return (
    <>
      <EmployeeSearchDialog
        isOpen={showEmployeeSearch}
        onClose={handleEmployeeSearchClose}
        onSelectEmployee={handleSelectEmployee}
      />

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 mx-auto rounded-md max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                Quit Claim Generation
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 sm:h-7 sm:w-7"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription />
          </DialogHeader>

          <div className="space-y-4">

            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Employee Details
              </label>
              <div
                className={`border rounded-md shadow-md p-3 cursor-pointer transition-colors ${
                  selectedEmployee
                    ? "border-border bg-background"
                    : "border-border bg-background hover:bg-accent/50"
                }`}
                onClick={handleEmployeeSearchClick}
              >
                {selectedEmployee ? (
                  <div className="space-y-3">
                    <EmployeeDetails
                      employee={selectedEmployee}
                      showValues={true}
                    />
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEmployeeSearchClick();
                        }}
                        className="flex-1"
                      >
                        Change
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClear();
                        }}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <Search className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Select employee
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              className="w-full"
              variant="default"
              onClick={handleGenerateQuitClaim}
              disabled={!selectedEmployee || isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                "Generate Quit Claim"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
