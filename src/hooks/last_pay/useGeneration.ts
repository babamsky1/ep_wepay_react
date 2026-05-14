import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Employee } from "@/hooks/data_fetching/employees/useEmployees";

interface UseGenerationProps {
  onClose: () => void;
  onGenerated?: (ref_no: string) => void;
}

export function useGeneration({ onClose, onGenerated }: UseGenerationProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedEmployee(null);
    onClose();
  }, [onClose]);

  const handleSelectEmployee = useCallback(
    async (employee: Employee) => {
      setSelectedEmployee(employee);
      setShowEmployeeSearch(false);
      toast.success(`${employee.first_name} has been selected.`);
    },
    [],
  );

  const handleGenerateQuitClaim = useCallback(async () => {
    if (!selectedEmployee || isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      // Auto-fetch employee's latest timesheet
      let timesheetId = "";
      try {
        const timesheetResponse = await api.timesheetRecords.list({
          emp_id: selectedEmployee.emp_id,
        });
        
        if (timesheetResponse.data && timesheetResponse.data.length > 0) {
          // Get the most recent timesheet (first in the list, assuming it's ordered by date)
          const latestTimesheet = timesheetResponse.data[0];
          timesheetId = latestTimesheet.timesheet_id;
          
          if (!timesheetId) {
            toast.error("No valid timesheet found for this employee. Please upload a timesheet first.");
            return;
          }
        } else {
          toast.error("No timesheet found for this employee. Please upload a timesheet first.");
          return;
        }
      } catch (timesheetError: any) {
        console.error("Error fetching timesheet:", timesheetError);
        toast.error("Failed to fetch employee timesheet. Please try again.");
        return;
      }

      // Call the backend API endpoint without last_day parameter
      const response = await api.lastPayGeneration.generate({
        emp_id: selectedEmployee.emp_id,
        active_user: user?.name || "system",
        timesheet_id: timesheetId,
      });

      // Handle response - backend returns direct data
      if (!response) {
        toast.error("No response from server");
        return;
      }

      // Debug: Log the actual response structure
      console.log('API Response:', response);
      console.log('Response Data:', response.data);

      // Check for backend error in response
      if (response.data?.error) {
        toast.error(response.data.error);
        return;
      }

      const savedRecord = response.data;

      if (!savedRecord || !savedRecord.ref_no) {
        toast.error("Invalid response from server: Missing reference number");
        return;
      }

      // Prefetch record into cache to avoid redundant fetch
      queryClient.setQueryData(["record", savedRecord.ref_no], savedRecord);

      // Invalidate list cache to refresh when user returns
      queryClient.invalidateQueries({ queryKey: ["allRecords"] });

      toast.success(`Quit Claim Generated Successfully: Reference ID: ${savedRecord.ref_no}`);

      // Call optional callback
      if (onGenerated) {
        onGenerated(savedRecord.ref_no);
      }

      navigate(`/lastpay/${savedRecord.ref_no}`);
    } catch (error: any) {
      console.error('Error in generate quit claim:', error);
      
      // Handle specific backend error responses
      if (error.response?.data?.data?.error) {
        toast.error(error.response.data.data.error);
      } else if (error.response?.data?.data?.message) {
        toast.error(error.response.data.data.message);
      } else if (error.message) {
        // Handle errors from apiFetch (network errors, etc.)
        toast.error(error.message);
      } else if (error.response?.status === 400) {
        toast.error("Invalid request. Please check the employee data and try again.");
      } else if (error.response?.status === 404) {
        toast.error("Employee not found. Please select a valid employee.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error("Error generating quit claim. Please try refreshing the page.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, [
    selectedEmployee,
    queryClient,
    navigate,
    user,
    isGenerating,
    onGenerated,
  ]);

  const handleClear = useCallback(() => {
    setSelectedEmployee(null);
  }, []);

  const handleEmployeeSearchClick = useCallback(() => {
    setShowEmployeeSearch(true);
  }, []);

  const handleEmployeeSearchClose = useCallback(() => {
    setShowEmployeeSearch(false);
  }, []);

  return {
    // State
    selectedEmployee,
    showEmployeeSearch,
    isGenerating,
    
    // Handlers
    handleClose,
    handleSelectEmployee,
    handleGenerateQuitClaim,
    handleClear,
    handleEmployeeSearchClick,
    handleEmployeeSearchClose,
  };
}
