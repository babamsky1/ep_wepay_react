import { DataTable } from "@/components/layout/DataTable";
import { toast } from "react-toastify";
import { Button } from "@/components/shared_components/button";
import { Input } from "@/components/shared_components/input";
import { StatusBadge } from "@/components/shared_components/StatusBadge";
import { LoadingState } from "@/components/shared_components/LoadingState";
import { ErrorState } from "@/components/shared_components/ErrorState";
import { useAllRecords } from "@/hooks/data_fetching/quit-claim/useLastPayRecords";
import { useTableFilters } from "@/hooks/table_filters/useTableFilters";
import { usePermissions } from "@/hooks/permission/usePermissions";
import { QuitClaimGeneration } from "@/pages/last_pay/lastpay/modals/QuitClaimGeneration";
import {
  Company,
  EmploymentStatus,
  QuitClaimStatus,
} from "@/types/lastPayTypes";
import { safeFormatDate } from "@/helpers/dateUtils";
import {
  FileText,
  Filter,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const EMP_STATUS_MAP: Record<string, EmploymentStatus> = {
  Reg: "Regular",
  Prob: "Probationary",
  Cont: "Contractual",
  Proj: "Project-based",
  Part: "Part-time",
  Intr: "Internship",
};

const FILTER_FIELDS = [
  {
    key: "emp_name",
    label: "Employee Name",
    placeholder: "e.g., Juan Dela Cruz",
  },
  { key: "ref_no", label: "Reference ID", placeholder: "e.g., REF0302-0001" },
  {
    key: "position",
    label: "Position",
    placeholder: "e.g., Software Engineer",
  },
  {
    key: "quitClaimSummaryStatus",
    label: "Quit Claim Status",
    placeholder: "e.g., Released",
  },
  { key: "emp_id", label: "Employee ID", placeholder: "e.g., EMP-001234" },
  {
    key: "department",
    label: "Department",
    placeholder: "e.g., IT Department",
  },
  {
    key: "employmentStatus",
    label: "Employment Status",
    placeholder: "e.g., Regular",
  },
  { key: "company", label: "Company", placeholder: "e.g., EXXEL PRIME" },
  { key: "generationDate", label: "Year", placeholder: "e.g., 2024" },
] as const;

type TableRow = {
  ref_no: string;
  emp_id: string;
  emp_name: string;
  position: string;
  department: string;
  employmentStatus?: EmploymentStatus;
  company?: Company;
  status: QuitClaimStatus;
  generatedAt?: string;
};

const toEmpStatus = (abbrev: string): EmploymentStatus =>
  EMP_STATUS_MAP[abbrev] ?? "Regular";

const matchesFilter = (row: TableRow, key: string, value: string): boolean => {
  if (!value) return true;
  if (key === "quitClaimSummaryStatus") return row.status === value;
  if (key === "generationDate")
    return row.generatedAt?.includes(value) ?? false;
  return String(row[key as keyof TableRow] ?? "")
    .toLowerCase()
    .includes(value.toLowerCase());
};

const RefLink = ({
  value,
  ref_no,
  status,
}: {
  value: string;
  ref_no: string;
  status: QuitClaimStatus;
}) => {
  const { role } = usePermissions();

  const handleClick = (e: React.MouseEvent) => {
    if (role === "hr" && status !== "PENDING") {
      e.preventDefault();
      toast.error("You only have access to PENDING status of quit claim records.");
    } else {
      e.stopPropagation();
    }
  };

  return (
    <Link
      to={`/lastpay/${ref_no}`}
      className="text-blue-800 underline underline-offset-2 hover:text-blue-600 font-mono text-xs transition-colors"
      onClick={handleClick}
    >
      {value}
    </Link>
  );
};

const COLUMNS = [
  {
    key: "ref_no",
    header: "Reference ID",
    flex: 1,
    minWidth: 150,
    render: (v: string, row: TableRow) => (
      <RefLink value={v} ref_no={row.ref_no} status={row.status} />
    ),
  },
  { key: "emp_id", header: "Employee ID", flex: 1, minWidth: 120 },
  { key: "emp_name", header: "Employee Name", flex: 1, minWidth: 150 },
  { key: "position", header: "Position", flex: 1, minWidth: 150 },
  { key: "department", header: "Department", flex: 1, minWidth: 120 },
  {
    key: "employmentStatus",
    header: "Employment Status",
    flex: 1,
    minWidth: 120,
  },
  { key: "company", header: "Company", flex: 1, minWidth: 120 },
  {
    key: "generatedAt",
    header: "Generation Date",
    flex: 1,
    minWidth: 120,
    render: (v: string) => safeFormatDate(v),
  },
  {
    key: "status",
    header: "Status",
    flex: 1,
    minWidth: 120,
    resizable: false,
    render: (v: string) => <StatusBadge value={v} />,
  },
];

const LastPayContent = () => {
  const initialFilters = {
    emp_name: "",
    ref_no: "",
    position: "",
    quitClaimSummaryStatus: "",
    emp_id: "",
    department: "",
    employmentStatus: "",
    company: "",
    generationDate: "",
  };

  const {
    inputFilters,
    appliedFilters,
    updateFilter,
    applyFilters,
    clearFilters,
    filterFields,
  } = useTableFilters(FILTER_FIELDS, initialFilters);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { canGenerateQuitClaim } = usePermissions();

  const { data, isLoading, isError, error } = useAllRecords();
  const records = data ?? [];

  const tableData = useMemo(() => {
    return records
      .filter((record) => record && record.ref_no) // Filter out undefined records
      .map(
        ({
          ref_no,
          emp_id,
          emp_name,
          position,
          dept_name,
          emp_status,
          comp_name,
          lp_status,
          created_at,
        }) => ({
          ref_no: ref_no,
          emp_id: emp_id,
          emp_name: emp_name,
          position: position ?? "Unknown",
          department: dept_name ?? "Unknown",
          employmentStatus: toEmpStatus(emp_status),
          company: (comp_name as Company) || "Unknown Company",
          status: lp_status,
          generatedAt: created_at || undefined,
        }),
      )
      .filter((row) =>
        Object.entries(appliedFilters).every(([key, val]) =>
          matchesFilter(row, key, val),
        ),
      )
      .sort((a, b) => b.ref_no.localeCompare(a.ref_no));
  }, [records, appliedFilters]);

  return (
    <>
      <div className="h-full bg-white flex flex-col overflow-hidden px-4 sm:px-10 lg:px-20 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between px-0 sm:px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Quit Claim
          </h1>
          {canGenerateQuitClaim && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="default"
              size="lg"
              className="gap-2 text-sm sm:text-base px-3 sm:px-4"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Create Quit Claim</span>
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        <div className="border border-gray-200 rounded-md shadow-sm overflow-hidden">
          {/* Filter Inputs */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {filterFields.map(({ key, label, placeholder }) => {
                const filterKey = key as keyof typeof initialFilters;
                const isActive = !!appliedFilters[filterKey];
                return (
                  <div key={key}>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <p className="text-sm font-medium text-slate-700">
                        {label}
                      </p>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        placeholder={placeholder}
                        value={inputFilters[filterKey]}
                        onChange={(e) => updateFilter(filterKey, e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                        className={`bg-white rounded-md shadow-md h-10 placeholder:font-thin text-sm pr-8 transition-colors duration-200 ${
                          isActive
                            ? "border-emerald-400 ring-1 ring-emerald-300"
                            : "border-border"
                        }`}
                      />
                      {isActive && (
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button
                onClick={applyFilters}
                variant="secondary"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Filter className="h-4 w-4 mr-1" /> Filter
              </Button>
              <Button
                onClick={clearFilters}
                variant="destructive"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="min-h-[510px] max-h-[510px]">
          {isLoading ? (
            <LoadingState message="Loading quit claim records..." />
          ) : isError ? (
            <ErrorState message={error?.message || "Please try again later"} />
          ) : (
            <DataTable
              data={tableData}
              idField="ref_no"
              columns={COLUMNS}
              emptyMessage="No employee records found"
              className="h-full"
              enableSorting
              enableFilter
              theme="ag-theme-alpine"
              paginationPageSize={25}
            />
          )}
        </div>
      </div>

      <QuitClaimGeneration
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default LastPayContent;
