import { useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useAllEmployees, Employee } from "@/hooks/data_fetching/employees/useEmployees";

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  emp_id: string;
  role: "superadmin" | "finance" | "hr" | "manager";
  birthDate?: string;
  sex?: "Male" | "Female";
  maritalStatus?: string;
  password: string;
  confirmPassword: string;
}

export interface User extends Record<string, unknown> {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emp_id: string;
  role: "superadmin" | "finance" | "hr" | "manager";
  lastLogin?: string;
  system_password?: string;
}

interface EmployeeCreatePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  sex?: "Male" | "Female";
  maritalStatus?: string;
  role?: "superadmin" | "finance" | "hr" | "manager";
  performed_by?: string;
}

interface EmployeeUpdatePayload {
  emp_id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  birthDate?: string;
  sex?: "Male" | "Female";
  maritalStatus?: string;
  role?: "superadmin" | "finance" | "hr" | "manager";
  performed_by?: string;
}

export const useAccessRights = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const actorName = user?.name || "system";
  const { data: employees = [] } = useAllEmployees();

  const getRoleByRoleId = useCallback((
    roleId: number | null | undefined,
  ): "superadmin" | "finance" | "hr" | "manager" => {
    switch (roleId) {
      case 1:
        return "superadmin";
      case 2:
        return "finance";
      case 3:
        return "hr";
      case 4:
        return "manager";
      default:
        return "hr";
    }
  }, []);

  // Map Employee to User interface
  const mapEmployeeToUser = useCallback((employee: Employee): User | null => {
    // Skip employees without system_access or with 'N' (No access)
    if (!employee.system_access || employee.system_access === "N") {
      return null;
    }

    return {
      id: employee.emp_id,
      name: `${employee.first_name || ""} ${employee.last_name || ""}`.trim(),
      firstName: employee.first_name || "",
      lastName: employee.last_name || "",
      email: employee.email_address || "",
      emp_id: employee.emp_id,
      role: getRoleByRoleId(employee.role_id),
      lastLogin: undefined,
      system_password: employee.system_password || "",
    };
  }, []);

  // Get mapped users from employees
  const users = useMemo(() => {
    return employees
      .map(mapEmployeeToUser)
      .filter((user): user is User => user !== null) as User[];
  }, [employees, mapEmployeeToUser]);

  // Validate form data
  const validateFormData = useCallback((formData: UserFormData): string | null => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.role) return "Role is required";
    if (!formData.password.trim()) return "Password is required";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  }, []);

  const createUser = useCallback(async (formData: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validationError = validateFormData(formData);
      if (validationError) {
        throw new Error(validationError);
      }

      const payload: EmployeeCreatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate,
        sex: formData.sex,
        maritalStatus: formData.maritalStatus,
        role: formData.role,
        performed_by: actorName,
      };

      await api.employees.create(payload as any);

      toast.success("User created successfully");
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [actorName]);

  const updateUser = useCallback(async (formData: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data (password is optional for updates)
      if (formData.password) {
        const validationError = validateFormData(formData);
        if (validationError && validationError !== "Password is required") {
          throw new Error(validationError);
        }
      } else {
        // Validate other fields without password
        const tempFormData = { ...formData, password: "temp", confirmPassword: "temp" };
        const validationError = validateFormData(tempFormData);
        if (validationError && validationError !== "Password is required") {
          throw new Error(validationError);
        }
      }

      const payload: EmployeeUpdatePayload = {
        emp_id: formData.emp_id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        birthDate: formData.birthDate,
        sex: formData.sex,
        maritalStatus: formData.maritalStatus,
        performed_by: actorName,
      };

      // Only include password if it's provided
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.employees.update(payload as any);

      toast.success("User updated successfully");
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [actorName]);

  const deleteUser = useCallback(async (emp_id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await api.employees.delete(emp_id, actorName);

      toast.success("User deleted successfully");
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [actorName]);


  return {
    createUser,
    updateUser,
    deleteUser,
    isLoading,
    error,
    clearError: () => setError(null),
    users,
    validateFormData,
  };
};
