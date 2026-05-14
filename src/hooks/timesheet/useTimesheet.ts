import { useState, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTimesheetRecords } from "@/hooks/data_fetching/timesheet/useTimesheetRecords";
import { useTimesheetActionLogLazy } from "@/hooks/action_log/useActionLog";
import { useTableFilters } from "@/hooks/table_filters/useTableFilters";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/services/api";
import { TimesheetRecord } from "@/types/lastPayTypes";
import { Employee } from "@/hooks/data_fetching/employees/useEmployees";

// Constants
const FILTER_FIELDS = [
  { key: "emp_name", label: "Employee Name", placeholder: "e.g., Juan Dela Cruz" },
  { key: "emp_id", label: "Employee ID", placeholder: "e.g., EMP-001234" },
  { key: "timesheet_id", label: "Timesheet ID", placeholder: "e.g., TS0302-0001" },
  { key: "uploadDate", label: "Upload Date", placeholder: "e.g., 2024" },
] as const;

const initialFilters = {
  emp_name: '',
  timesheet_id: '',
  emp_id: '',
  dept_name: '',
  uploadDate: '',
};

// Helper functions
const matchesFilter = (row: TimesheetRecord, key: string, value: string): boolean => {
  if (!value) return true;
  if (key === "uploadDate") return row.uploaded_at?.includes(value) ?? false;
  return String(row[key as keyof TimesheetRecord] ?? "").toLowerCase().includes(value.toLowerCase());
};

const splitEmployeeName = (fullName: string) => {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return { first_name: nameParts[0], last_name: '' };
  }
  return {
    first_name: nameParts[0],
    last_name: nameParts.slice(1).join(' ')
  };
};

const validateFile = (file: File): string | null => {
  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return 'File size must be less than 10MB';
  }

  // Upload only accepts .txt files
  if (!file.name.toLowerCase().endsWith('.txt')) {
    return 'Please upload a valid text file (.txt)';
  }

  return null;
};

export const useTimesheet = (onClose?: () => void) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Data fetching
  const { data, isLoading, isError, error } = useTimesheetRecords();
  const records = data || [];

  // Filter management
  const {
    inputFilters,
    appliedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    filterFields,
  } = useTableFilters(FILTER_FIELDS, initialFilters);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetRecord | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLogOpen, setActionLogOpen] = useState(false);

  // File operation states
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploadConfirmOpen, setIsUploadConfirmOpen] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'gerkie'>('file');

  // Action log
  const { actionLogEntries, formatDateTime } = useTimesheetActionLogLazy(actionLogOpen);

  
  // Computed values
  const tableData = useMemo(() => {
    return records
      .filter((record: TimesheetRecord) => record && record.timesheet_id)
      .map((record: TimesheetRecord) => ({
        ...record,
        dept_name: record.dept_name ?? "Unknown",
      }))
      .filter((row: TimesheetRecord) => Object.entries(appliedFilters).every(([key, val]) => matchesFilter(row, key, val)));
  }, [records, appliedFilters]);

  const employeeData = useMemo(() => {
    // For upload mode, use selectedEmployee
    if (selectedEmployee) {
      return selectedEmployee;
    }
    
    // For edit mode, use selectedTimesheet
    if (selectedTimesheet) {
      const { first_name, last_name } = splitEmployeeName(selectedTimesheet.emp_name);
      return {
        emp_id: selectedTimesheet.emp_id,
        first_name: first_name,
        last_name: last_name,
        position: selectedTimesheet.position,
        dept_name: selectedTimesheet.dept_name,
      } as Partial<Employee>;
    }
    
    return null;
  }, [selectedEmployee, selectedTimesheet]);

  // Data operations
  const handleDelete = useCallback((row: TimesheetRecord) => {
    setSelectedTimesheet(row);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedTimesheet || isDeleting) return;

    setIsDeleting(true);

    try {
      await api.timesheet.delete(selectedTimesheet.emp_id, user?.name || "system");

      queryClient.invalidateQueries({ queryKey: ["timesheetRecords"] });
      queryClient.invalidateQueries({ queryKey: ["actionLog", "TimesheetRecord"] });

      toast.success(`Timesheet ${selectedTimesheet.timesheet_id} deleted successfully`);
      setIsDeleteConfirmOpen(false);
      setSelectedTimesheet(null);
    } catch (error: any) {
      toast.error(error?.message || "Error deleting timesheet. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }, [selectedTimesheet, isDeleting, user, queryClient]);

  // File operations
  const handleSelectEmployee = useCallback(async (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeSearch(false);
    toast.success(`${employee.first_name} has been selected.`);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSelectedFile(file);
    toast.success(`${file.name} selected for upload`);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  const handleProcessTimesheet = useCallback(async () => {
    if (!selectedEmployee || !selectedFile || isProcessing) return;
    setIsUploadConfirmOpen(true);
  }, [selectedEmployee, selectedFile, isProcessing]);

  const handleConfirmUpload = useCallback(async () => {
    if (!selectedEmployee || !selectedFile || isProcessing) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('emp_id', selectedEmployee.emp_id);
      formData.append('performed_by', user?.name || "system");

      const response = await api.timesheet.upload(formData);

      if (!response.data?.timesheet_id) {
        toast.error("Invalid response from server.");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["timesheetRecords"] });
      queryClient.invalidateQueries({ queryKey: ["actionLog", "TimesheetRecord"] });

      toast.success(`Timesheet Uploaded Successfully: ID: ${response.data.timesheet_id}`);
      setIsUploadConfirmOpen(false);
      handleClose();
    } catch (error: any) {
      toast.error(error?.message || "Error uploading timesheet. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmployee, selectedFile, isProcessing, user, queryClient, onClose]);


  // Modal controls
  const handleClose = useCallback(() => {
    setSelectedEmployee(null);
    setSelectedFile(null);
    setUploadMethod('file');
    if (onClose) onClose();
  }, [onClose]);

  const openUploadModal = useCallback(() => setIsModalOpen(true), []);
  const closeUploadModal = useCallback(() => setIsModalOpen(false), []);
  const openActionLog = useCallback(() => setActionLogOpen(true), []);
  const closeActionLog = useCallback(() => setActionLogOpen(false), []);
  const closeDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
    setSelectedTimesheet(null);
  }, []);

  const openEmployeeSearch = () => setShowEmployeeSearch(true);
  const closeEmployeeSearch = () => setShowEmployeeSearch(false);
  const closeUploadConfirm = () => setIsUploadConfirmOpen(false);
  const handleClearFile = () => setSelectedFile(null);
  const clearSelectedEmployee = () => setSelectedEmployee(null);
  const setFileUploadMethod = () => setUploadMethod('file');
  const setGerkieMethod = () => setUploadMethod('gerkie');
  const showFileSelectError = (message: string) => {
    toast.error(message);
  };

  return {
    // Data
    tableData,
    records,
    isLoading,
    isError,
    error,
    employeeData,
    
    // Filters
    inputFilters,
    appliedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    filterFields,
    
    // States
    isModalOpen,
    selectedTimesheet,
    isDeleteConfirmOpen,
    isDeleting,
    actionLogOpen,
    actionLogEntries,
    formatDateTime,
    
    // File states
    selectedEmployee,
    showEmployeeSearch,
    isProcessing,
    selectedFile,
    dragActive,
    isUploadConfirmOpen,
    uploadMethod,
    
    // Data actions
    handleDelete,
    handleConfirmDelete,
    setSelectedTimesheet,
    
    // File actions
    handleSelectEmployee,
    handleFileSelect,
    handleDrag,
    handleDrop: (e: React.DragEvent) => handleDrop(e),
    handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => handleFileInputChange(e),
    handleProcessTimesheet: () => handleProcessTimesheet(),
    handleConfirmUpload,
    
    // Modal controls
    openUploadModal,
    closeUploadModal,
    openActionLog,
    closeActionLog,
    closeDeleteConfirm,
    handleClose,
    openEmployeeSearch,
    closeEmployeeSearch,
    closeUploadConfirm,
    handleClearFile,
    clearSelectedEmployee,
    setFileUploadMethod,
    setGerkieMethod,
    showFileSelectError,
  };
};
