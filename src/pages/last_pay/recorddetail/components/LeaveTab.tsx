import { formatCurrency } from "@/helpers/currency";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { LeaveMonthlyBreakdown } from "@/types/lastPayTypes";
import { getMonthName } from "@/helpers/dateUtils";



const LeaveTab = () => {
  const { record } = useLastPayContext();

  // Calculate leave summary from monthly breakdown
  const totalDaysUsed = record.leave_monthly_breakdown?.reduce((sum, entry) => sum + Number(entry.days_used || 0), 0) || 0;
  const sortedBreakdown = record.leave_monthly_breakdown?.sort((a, b) => (a.coverage_month || 0) - (b.coverage_month || 0)) || [];
  const totalRemaining = sortedBreakdown.length > 0 ? Number(sortedBreakdown[sortedBreakdown.length - 1].remaining || 0) : 0;

  return (
    <div className="space-y-5">

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="max-h-70 overflow-y-auto">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[40%]" />
              <col className="w-[30%]" />
              <col className="w-[30%]" />
            </colgroup>
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Coverage Month
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Days Used
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {record.leave_monthly_breakdown && record.leave_monthly_breakdown.length > 0 ? (
                [...record.leave_monthly_breakdown].sort((a, b) => {
                  return (a.coverage_month || 0) - (b.coverage_month || 0);
                })?.map((entry: LeaveMonthlyBreakdown) => {
                  const { coverage_month, days_used, remaining } = entry;
                  return (
                    <tr
                      key={`${coverage_month || 'unknown'}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-gray-700">
                        {getMonthName(coverage_month)}
                      </td>
                      <td className="px-4 py-2.5 text-left text-gray-700">
                        {days_used}
                      </td>
                      <td className="px-4 py-2.5 text-left text-gray-700">
                        {remaining}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No Credits used
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion summary */}
      <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-4 space-y-2">
        <p className="text-sm font-bold text-green-700 uppercase tracking-wider">
          Leave Conversion
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Days Used</span>
          <span className="font-medium">{totalDaysUsed} {totalDaysUsed === 1 ? "day" : "days"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Remaining Credits</span>
          <span className="font-medium">{totalRemaining} {totalRemaining === 1 ? "credit" : "credits"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Daily Rate</span>
          <span className="font-medium">
            {formatCurrency(Number(record.daily_rate || 0))}
          </span>
        </div>
        <div className="flex justify-between items-left pt-2 border-t border-green-300">
          <span className="text-sm font-semibold text-gray-700">
            Total Leave Conversion Amount
          </span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(record.lp_total_leave || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeaveTab;
