import { TrendingUp, Clock, FileText } from "lucide-react";
import { formatCurrency } from "@/helpers/currency";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { formatDateLong } from "@/helpers/dateUtils";

const SummaryTab = () => {
  const { record } = useLastPayContext();

  return (
    <div className="space-y-6">
      {/* Employee Information */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Employee Information
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">Employee Name</div>
            <div className="text-sm font-medium text-gray-700">
              {record.emp_name ?? "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">Employee ID</div>
            <div className="text-sm font-medium text-gray-700">
              {record.emp_id ?? "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">Department</div>
            <div className="text-sm font-medium text-gray-700">
              {record.dept_name ?? "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">Position</div>
            <div className="text-sm font-medium text-gray-700">
              {record.position ?? "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">
              Employment Status
            </div>
            <div className="text-sm font-medium text-gray-700">
              {record.emp_status ?? "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">Company</div>
            <div className="text-sm font-medium text-gray-700">
              {record.comp_name || "Not specified"}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-2 py-2">
            <div className="text-xs text-gray-400 mb-0.5">Employment Type</div>
            <div className="text-sm font-medium text-gray-700">
              {record.emp_type ?? "In-house"}
            </div>
          </div>
        </div>
      </div>

      {/* Pay Computation */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Pay Computation
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between px-1">
            <span className="text-gray-500">Daily Rate</span>
            <span className="font-medium">
              {formatCurrency(Number(record.daily_rate))}
            </span>
          </div>
          <div className="flex justify-between px-1">
            <span className="text-gray-500">Total Working Days</span>
            <span className="font-medium">
              {Number(record.total_days_worked ?? 0)} days
            </span>
          </div>

        </div>
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex justify-between px-1">
            <span className="text-gray-700 font-semibold">Total Basic Pay</span>
            <span className="font-bold text-gray-900">
              {formatCurrency(Number(record.basic_pay ?? 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Last Pay Summary rows */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
          Summary
        </p>
        <div className="rounded-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          {/* Total Basic Pay — static */}
          <div className="flex justify-between items-center px-4 py-3 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Basic Pay</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatCurrency(Number(record.basic_pay ?? 0))}
            </span>
          </div>

          {/* Total Allowances — static */}
          <div className="flex justify-between items-center px-4 py-3 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center">
                <FileText className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Total Allowances</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatCurrency(Number(record.lp_total_allowance ?? 0))}
            </span>
          </div>

          {/* Leave Amount — static */}
          <div className="flex justify-between items-center px-4 py-3 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Leave Credit Amount</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatCurrency(Number(record.lp_total_leave ?? 0))}
            </span>
          </div>

          {/* Overtime Amount — static */}
          <div className="flex justify-between items-center px-4 py-3 bg-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <Clock className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm text-gray-600">Overtime Amount</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatCurrency(Number(record.lp_total_ot ?? 0))}
            </span>
          </div>
        </div>

        {/* Total Last Pay */}
        <div className="flex justify-between items-center mt-3 px-4 py-3 bg-green-600 rounded-xl">
          <span className="text-md font-bold text-white">Last Pay</span>
          <span className="text-2xl font-bold text-white">
            {formatCurrency(Number(record.last_pay ?? 0))}
          </span>
        </div>
      </div>

      {/* Processing Info */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Processing Info
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Created At",
              value: formatDateLong(record.created_at || ""),
            },
            { label: "Created By", value: record.created_by },
            {
              label: "Released At",
              value: record.released_at
                ? formatDateLong(record.released_at)
                : "Not released",
            },
            {
              label: "Released By",
              value: record.released_by || "Not released",
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
              <div className="text-xs text-gray-400 mb-0.5">{label}</div>
              <div className="text-sm font-medium text-gray-700">
                {value ?? "Not specified"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
