import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export interface Employee {
  emp_id: string;
  first_name?: string;
  last_name?: string;
  position?: string;
  dept_name?: string;
  company?: string;
  role_id?: number | null;
  email_address?: string | null;
  system_access?: string | null;
  system_password?: string | null;
  date_hired?: string;
  daily_rate?: number;
}

export interface EmployeeSearchParams {
  emp_id?: string;
  emp_name?: string;
}

/**
 * Hook for searching specific employees by ID or name
 * Used in EmployeeSearchDialog for finding specific employees
 */
export function useEmployeeSearch(searchParams?: EmployeeSearchParams) {
  const emp_id = searchParams?.emp_id?.trim();
  const emp_name = searchParams?.emp_name?.trim();

  return useQuery<Employee[]>({
    queryKey: ["employees", "search", { emp_id, emp_name }],
    queryFn: async (): Promise<Employee[]> => {
      const params: Record<string, string> = {};
      if (emp_id) params.employee_id = emp_id;
      if (emp_name) params.employee_name = emp_name;

      const response = await api.employees.list(params);
      const employees = response.data as unknown as Employee[];
      
      // Sort by employee ID in descending order (newest first)
      return employees.sort((a, b) => b.emp_id.localeCompare(a.emp_id));
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    enabled: !!(emp_id || emp_name), // Only enable when search params exist
  });
}

export function useAllEmployees(page = 1, page_size = 25) {
  return useQuery<Employee[]>({
    queryKey: ["employees", page, page_size],
    queryFn: async (): Promise<Employee[]> => {
      const response = await api.employees.list({ page, page_size });
      const employees = response.data as unknown as Employee[];
      
      // Sort by employee ID in descending order (newest first)
      return employees.sort((a, b) => b.emp_id.localeCompare(a.emp_id));
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}