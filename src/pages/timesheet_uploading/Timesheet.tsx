import { DataTable } from "@/components/layout/DataTable";
import { Button } from "@/components/shared_components/button";
import { Input } from "@/components/shared_components/input";
import { LoadingState } from "@/components/shared_components/LoadingState";
import { ErrorState } from "@/components/shared_components/ErrorState";
import { safeFormatDate } from "@/helpers/dateUtils";
import { Filter, X, Upload, Trash2, History, AlertCircle } from "lucide-react";
import { TimesheetUpload } from "./modals/TimesheetUpload";
import { ConfirmationModal } from "@/components/shared_components/ConfirmationModal";
import { ActionLogTable } from "@/components/shared_components/ActionLogTable";
import { useTimesheet } from "@/hooks/timesheet/useTimesheet";

const TimesheetUploading = () => {
  const {
    tableData,
    isLoading,
    isError,
    error,
    inputFilters,
    appliedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    filterFields,
    isModalOpen,
    selectedTimesheet,
    isDeleteConfirmOpen,
    isDeleting,
    actionLogOpen,
    actionLogEntries,
    formatDateTime,
    handleDelete,
    handleConfirmDelete,
    openUploadModal,
    closeUploadModal,
    openActionLog,
    closeActionLog,
    closeDeleteConfirm,
  } = useTimesheet();

  const showNoDataMessage = tableData.length === 0;

  const COLUMNS = [
    { key: "timesheet_id", header: "Timesheet ID", flex: 1, minWidth: 150},
    { key: "emp_id", header: "Employee ID", flex: 1, minWidth: 120 },
    { key: "emp_name", header: "Employee Name", flex: 1, minWidth: 120 },
    { key: "uploaded_at", header: "Uploaded At", flex: 1, minWidth: 120, render: (v: string) => safeFormatDate(v) },
    {
      key: "actions",
      header: "Actions",
      flex: 1,
      minWidth: 120,
      render: (_: any, row: any) => (
        <div className="flex gap-2 ">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(row)}
          >
            <Trash2 className="h-2 w-2" />
            <span className="text-xs">Delete</span>
          </Button>
        </div>
      )
    },
  ];

  return (
      <div className="h-full bg-white flex flex-col overflow-hidden px-4 sm:px-10 lg:px-20 py-4 space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between px-0 sm:px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Timesheet Uploading</h1>
          <div className="flex gap-2">
            <Button onClick={openActionLog} variant="outline" size="lg" className="gap-2 text-sm sm:text-base px-3 sm:px-4">
              <History className="h-4 w-4 shrink-0" />
              <span>Action Log</span>
            </Button>
            <Button onClick={openUploadModal} variant="default" size="lg" className="gap-2 text-sm sm:text-base px-3 sm:px-4">
              <Upload className="h-4 w-4 shrink-0" />
              <span>Upload Timesheet</span>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden">
          {/* Filter Inputs */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {filterFields.map(({ key, label, placeholder }) => {
                const filterKey = key as keyof typeof inputFilters;
                const isActive = !!appliedFilters[filterKey];
                return (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <p className="text-sm font-medium text-slate-700">{label}</p>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                    </div>
                    <div className="relative">
                      <Input
                        placeholder={placeholder}
                        value={inputFilters[filterKey]}
                        onChange={(e) => updateFilter(filterKey, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                        className={`bg-white rounded-md shadow-md h-10 placeholder:font-thin text-sm pr-8 transition-colors duration-200 ${
                          isActive ? "border-emerald-400 ring-1 ring-emerald-300" : "border-border"
                        }`}
                      />
                      {isActive && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button onClick={applyFilters} variant="secondary" size="sm" className="flex-1 sm:flex-none">
                <Filter className="h-4 w-4 mr-1" /> Filter
              </Button>
              <Button onClick={clearFilters} variant="destructive" size="sm" className="flex-1 sm:flex-none">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="min-h-[590px] max-h-[590px]">
          {isLoading ? (
            <LoadingState message="Loading timesheet records..." />
          ) : isError ? (
            <ErrorState message={error?.message || 'Please try again later'} />
          ) : showNoDataMessage ? (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border">
              <AlertCircle className="h-8 w-8 text-amber-600 mb-4" />
              <p className="text-sm text-slate-600 mb-2">No timesheet records found</p>
              <p className="text-xs text-slate-500">Upload a timesheet to get started</p>
            </div>
          ) : (
            <DataTable
              data={tableData}
              idField="timesheet_id"
              columns={COLUMNS}
              emptyMessage="No timesheet records found"
              className="h-full"
              enableSorting
              enableFilter
              theme="ag-theme-alpine"
              paginationPageSize={25}
            />
          )}
        </div>

        <TimesheetUpload isOpen={isModalOpen} onClose={closeUploadModal} />
        <ConfirmationModal
          isOpen={isDeleteConfirmOpen}
          onClose={closeDeleteConfirm}
          title="Delete Timesheet"
          message={`Are you sure you want to delete all timesheet records for ${selectedTimesheet?.emp_name} (${selectedTimesheet?.emp_id})? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          variant="destructive"
          isLoading={isDeleting}
        />

      {/* Action Log Dialog */}
      <ActionLogTable
        isOpen={actionLogOpen}
        onClose={closeActionLog}
        actionLogEntries={actionLogEntries}
        formatDateTime={formatDateTime}
      />
    </div>
  );
};

export default TimesheetUploading;