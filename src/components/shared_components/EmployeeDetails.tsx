import { Employee } from "@/hooks/data_fetching/employees/useEmployees";

interface EmployeeDetailsProps {
  employee?: Employee | Partial<Employee> | null;
  showValues?: boolean;
}

export function EmployeeDetails({ employee, showValues = true }: EmployeeDetailsProps) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <p className="text-sm text-foreground flex justify-between w-full items-center">
        <span className="font-medium">Employee Name:</span>
        <span>{showValues ? `${employee?.first_name} ${employee?.last_name}` : undefined}</span>
      </p>
      <p className="text-sm text-foreground flex justify-between w-full items-center">
        <span className="font-medium">Employee ID:</span>
        <span>{showValues ? employee?.emp_id : undefined}</span>
      </p>
      <p className="text-sm text-foreground flex justify-between w-full items-center">
        <span className="font-medium">Position:</span>
        <span>{showValues ? employee?.position : undefined}</span>
      </p>
      <p className="text-sm text-foreground flex justify-between w-full items-center">
        <span className="font-medium">Department:</span>
        <span>{showValues ? employee?.dept_name || "Unknown Department" : undefined}</span>
      </p>
      <p className="text-sm text-foreground flex justify-between w-full items-center">
        <span className="font-medium">Company:</span>
        <span>
          {showValues ? employee?.company || "Unknown Company" : undefined}
        </span>
      </p>
    </div>
  );
}
