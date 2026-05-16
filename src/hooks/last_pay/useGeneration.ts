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
      const { data: savedRecord } = await api.lastPayGeneration.generate({
        emp_id: selectedEmployee.emp_id,
        active_user: user?.name || "system",
        timesheet_id: "",
      });

      queryClient.setQueryData(["record", savedRecord.ref_no], savedRecord);
      queryClient.invalidateQueries({ queryKey: ["allRecords"] });

      toast.success(`Quit Claim Generated Successfully: Reference ID: ${savedRecord.ref_no}`);

      if (onGenerated) {
        onGenerated(savedRecord.ref_no);
      }

      navigate(`/lastpay/${savedRecord.ref_no}`);
    } catch (error: any) {
      toast.error(error?.message || "Error generating quit claim. Please try again.");
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
