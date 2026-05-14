import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/shared_components/dialog";
import { Button } from "@/components/shared_components/button";
import { EmployeeDetails } from "@/components/shared_components/EmployeeDetails";
import { Search, X, Upload, FileText, Trash2, FileSpreadsheet } from "lucide-react";
import { EmployeeSearchDialog } from "@/pages/last_pay/lastpay/modals/EmployeeSearchDialog";
import { ConfirmationModal } from "@/components/shared_components/ConfirmationModal";
import { useTimesheet } from "@/hooks/timesheet/useTimesheet";
import { toast } from "react-toastify";

interface TimesheetUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded?: (timesheet_id: string) => void;
}

export function TimesheetUpload({ isOpen, onClose }: TimesheetUploadProps) {
  const {
    selectedEmployee,
    showEmployeeSearch,
    isProcessing,
    selectedFile,
    dragActive,
    isUploadConfirmOpen,
    uploadMethod,
    handleClose,
    handleSelectEmployee,
    handleProcessTimesheet,
    handleConfirmUpload,
    handleDrag,
    handleDrop,
    handleFileInputChange,
    handleClearFile,
    openEmployeeSearch,
    closeEmployeeSearch,
    closeUploadConfirm,
    setFileUploadMethod,
    setGerkieMethod,
    clearSelectedEmployee,
    showFileSelectError,
  } = useTimesheet(onClose);

  return (
    <>
      <EmployeeSearchDialog
        isOpen={showEmployeeSearch}
        onClose={closeEmployeeSearch}
        onSelectEmployee={handleSelectEmployee}
      />

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 mx-auto rounded-md max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                Timesheet Upload
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

            <DialogDescription>
              Upload a text file (.txt) containing timesheet dates for an employee
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Employee *
              </label>

              <div
                className={`border rounded-md shadow-md p-3 cursor-pointer transition-colors ${
                  selectedEmployee
                    ? "border-border bg-background"
                    : "border-border bg-background hover:bg-accent/50"
                }`}
                onClick={openEmployeeSearch}
              >
                {selectedEmployee ? (
                  <div className="space-y-3">
                    <EmployeeDetails employee={selectedEmployee} showValues />

                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEmployeeSearch();
                        }}
                      >
                        Change
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearSelectedEmployee();
                        }}
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

            {/* Upload Method Tabs - Only show after employee is selected */}
            {selectedEmployee && (
              <div className="space-y-3">
                <div className="flex space-x-1 rounded-lg bg-muted p-1">
                  <button
                    type="button"
                    onClick={setFileUploadMethod}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      uploadMethod === 'file'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={setGerkieMethod}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      uploadMethod === 'gerkie'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Gerkie Import
                  </button>
                </div>

                {/* Tab Content */}
                {uploadMethod === 'file' && (
                  <div className="space-y-2">
              
              {selectedFile ? (
                <div className="border rounded-md shadow-md p-3 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="h-8 w-8 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleClearFile}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
                    selectedEmployee
                      ? dragActive
                        ? "border-blue-400 bg-blue-50"
                        : "border-border bg-background hover:bg-accent/50 cursor-pointer"
                      : "border-border bg-muted/50 cursor-not-allowed opacity-50"
                  }`}
                  onDragEnter={selectedEmployee ? handleDrag : undefined}
                  onDragLeave={selectedEmployee ? handleDrag : undefined}
                  onDragOver={selectedEmployee ? handleDrag : undefined}
                  onDrop={selectedEmployee ? handleDrop : undefined}
                  onClick={() => {
                    if (!selectedEmployee) {
                      showFileSelectError("Please select an employee first before uploading a timesheet file.");
                    }
                  }}
                >
                  <Upload className={`w-8 h-8 mx-auto mb-3 ${selectedEmployee ? "text-muted-foreground" : "text-muted-foreground/50"}`} />
                  <p className={`text-sm mb-2 ${selectedEmployee ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                    {selectedEmployee 
                      ? "Drag and drop your timesheet file here, or click to browse"
                      : "Select an employee first to enable file upload"
                    }
                  </p>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileInputChange}
                    className="hidden"
                    id="timesheet-file-input"
                    disabled={!selectedEmployee}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedEmployee) {
                        document.getElementById('timesheet-file-input')?.click();
                      } else {
                        showFileSelectError("Please select an employee first before uploading a timesheet file.");
                      }
                    }}
                    disabled={!selectedEmployee}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
                  </div>
                )}
              </div>
            )}

            {uploadMethod === 'gerkie' && (
              <div className="space-y-3">
                <div className="border-2 border-dashed rounded-md p-8 text-center border-border bg-muted/30">
                  <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Gerkie Import
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Import timesheet data directly from Gerkie system.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mb-2"
                    onClick={() => toast.info("Gerkie import functionality will be available soon.")}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Import Gerkie Timesheet
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Button - Only show for file upload */}
            {uploadMethod === 'file' && (
              <Button
                className="w-full"
                variant="default"
                onClick={handleProcessTimesheet}
                disabled={!selectedEmployee || !selectedFile || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Timesheet
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <ConfirmationModal
        isOpen={isUploadConfirmOpen}
        onClose={closeUploadConfirm}
        title="Upload Timesheet"
        message={`Are you sure you want to upload the timesheet file "${selectedFile?.name}" for ${selectedEmployee?.first_name}? This will create a new timesheet record.`}
        onConfirm={handleConfirmUpload}
        variant="success"
        isLoading={isProcessing}
      />
    </>
  );
}
