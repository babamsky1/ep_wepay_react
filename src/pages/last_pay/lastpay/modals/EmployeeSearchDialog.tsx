import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shared_components/dialog";
import { Button } from "@/components/shared_components/button";
import { Input } from "@/components/shared_components/input";
import { useEmployeeSearch, Employee } from "@/hooks/data_fetching/employees/useEmployees";
import { XCircle, Search, Loader2, AlertCircle } from "lucide-react";

interface EmployeeSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee: (employee: Employee) => void;
}

export function EmployeeSearchDialog({ isOpen, onClose, onSelectEmployee }: EmployeeSearchDialogProps) {
  const [search, setSearch] = useState({ emp_id: "", emp_name: "" });
  const [applied, setApplied] = useState({ emp_id: "", emp_name: "" });

  const { data, isLoading, isError, error } = useEmployeeSearch(
    applied.emp_id || applied.emp_name ? applied : undefined
  );
  const records = (data ?? []) as Employee[];

  const empty = { emp_id: "", emp_name: "" };

  const handleSearch = () => setApplied(search);
  const handleClear = () => { setSearch(empty); setApplied(empty); };
  const handleClose = () => { handleClear(); onClose(); };
  const handleSelect = (employee: Employee) => onSelectEmployee(employee);

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-4xl min-h-[20vh] max-h-[80vh] sm:max-w-4xl max-w-[95vw] mx-auto sm:p-6 p-4 rounded-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              Search Employees
            </DialogTitle>
          </div>
          <DialogDescription>
            Search and select employees from the company directory
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-end">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <p className="text-sm font-medium text-slate-700">Employee ID</p>
                {applied.emp_id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </div>
              <div className="relative">
                <Input
                  placeholder="Employee ID..."
                  value={search.emp_id}
                  onChange={(e) => setSearch((prev) => ({ ...prev, emp_id: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={`bg-white rounded-md shadow-md h-10 placeholder:font-thin text-sm pr-8 transition-colors duration-200 ${
                    applied.emp_id
                      ? "border-emerald-400 ring-1 ring-emerald-300"
                      : "border-border"
                  }`}
                />
                {applied.emp_id && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <p className="text-sm font-medium text-slate-700">Employee Name</p>
                {applied.emp_name && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </div>
              <div className="relative">
                <Input
                  placeholder="Employee Name..."
                  value={search.emp_name}
                  onChange={(e) => setSearch((prev) => ({ ...prev, emp_name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className={`bg-white rounded-md shadow-md h-10 placeholder:font-thin text-sm pr-8 transition-colors duration-200 ${
                    applied.emp_name
                      ? "border-emerald-400 ring-1 ring-emerald-300"
                      : "border-border"
                  }`}
                />
                {applied.emp_name && (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSearch}
              className="w-full sm:w-auto border-2 border-dashed border-border hover:border-accent hover:bg-accent/10 transition-all"
            >
              <Search className="h-4 w-4 mr-1" />
              Search
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleClear}
              className="w-full sm:w-auto"
            >
              <XCircle className="h-4 w-4" />
              Clear
            </Button>
          </div>

          <div className="border border-border rounded-md max-h-64 sm:max-h-96 overflow-auto overflow-x-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-2" />
                <p className="text-xs text-slate-600">Loading employees...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center h-24">
                <AlertCircle className="h-6 w-6 text-red-600 mb-2" />
                <p className="text-xs text-slate-600 mb-1">Failed to load employees</p>
                <p className="text-xs text-slate-500">{error?.message || 'Please try again'}</p>
              </div>
            ) : (
              <table className="w-full text-sm min-w-[350px] sm:min-w-[500px]">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left px-2 sm:px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                    <th className="text-left px-2 sm:px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                    <th className="text-left px-2 sm:px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden sm:table-cell">Position</th>
                    <th className="w-12 px-2 sm:px-4 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record: Employee) => (
                    <tr
                      key={record.emp_id}
                      className="hover:bg-accent/50 cursor-pointer border-b transition-colors"
                      onClick={() => handleSelect(record)}
                    >
                      <td className="font-mono font-medium text-sm px-2 sm:px-4 py-2">{record.emp_id}</td>
                      <td className="font-medium text-sm px-2 sm:px-4 py-2">
                        <div>
                          <div>{`${record.first_name || ""} ${record.last_name || ""}`.trim()}</div>
                          <div className="text-xs text-muted-foreground sm:hidden">{record.position || "N/A"}</div>
                        </div>
                      </td>
                      <td className="text-sm text-muted-foreground px-2 sm:px-4 py-2 hidden sm:table-cell">{record.position || "N/A"}</td>
                      <td className="w-20 flex items-center justify-center px-2 sm:px-4 py-2">
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          className="h-8 px-2 sm:px-4 py-1 text-xs"
                          onClick={(e) => { e.stopPropagation(); onSelectEmployee(record); }}
                        >
                          SELECT
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={4} className="h-24 text-center text-muted-foreground px-2 sm:px-4 py-2">
                        {!Object.values(applied).some((v) => v.trim())
                          ? "Enter employee ID or name and click Search"
                          : "No employees found matching your search. Try different search terms."}
                          
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}