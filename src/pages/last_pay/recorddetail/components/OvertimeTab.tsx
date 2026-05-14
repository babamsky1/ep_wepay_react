import { formatCurrency } from "@/helpers/currency";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { formatDateLong } from "@/helpers/dateUtils";

const OvertimeTab = () => {
  const { record } = useLastPayContext();


  return (
    <div className="space-y-5">

      {/* Table */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        <div className="max-h-70 overflow-y-auto">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[25%]" />
              <col className="w-[25%]" />
              {/* <col className="w-[20%]" /> */}
              <col className="w-[25%]" />
              <col className="w-[25%]" />
            </colgroup>
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {[
                  "Date",
                  "Description",
                  // "Rate",
                  "Hours", 
                  "Amount",
                ].map((h, i) => (
                  <th
                    key={h}
                    className={`px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                      i === 0
                        ? "text-left"
                        : i === 4
                          ? "text-left"
                          : "text-left"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
              {record.overtime && record.overtime.length > 0 ? (
                record.overtime.map((ot) => {
                  return (
                    <tr
                      key={ot.overtime_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-gray-600">
                        {formatDateLong(ot.date_granted || '')}
                      </td>
                      <td className="px-3 py-2.5 text-left text-gray-800 font-medium">
                        <div>{ot.description || "Overtime"}</div>
                      </td>
                      {/* <td className="px-3 py-2.5 text-left text-gray-600">
                        {formatCurrency(ot.rate)}x
                      </td> */}
                      <td className="px-3 py-2.5 text-left text-gray-600">
                        {ot.hours}
                      </td>
                      <td className="px-3 py-2.5 text-left font-semibold text-gray-800">
                        {formatCurrency(Number(ot.amount))}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No overtime records available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-4 space-y-2">
        <p className="text-sm font-bold text-green-700 uppercase tracking-wider">
          Overtime Summary
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Hourly Rate</span>
          <span className="font-medium">{formatCurrency(Number(record.daily_rate ?? 0) / 8)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Equivalent Hours</span>
          <span className="font-medium">
            {Number(record.lp_total_ot ?? 0) > 0 && Number(record.daily_rate ?? 0) > 0 
              ? (Number(record.lp_total_ot ?? 0) / (Number(record.daily_rate ?? 0) / 8)).toFixed(2)
              : 0} {Number(record.lp_total_ot ?? 0) > 0 && Number(record.daily_rate ?? 0) > 0 
              ? (Number(record.lp_total_ot ?? 0) / (Number(record.daily_rate ?? 0) / 8)) === 1 ? "hour" : "hours"
              : "hours"}
          </span>
        </div>
        <div className="flex justify-between items-left pt-2 border-t border-green-300">
          <span className="text-sm font-semibold text-gray-700">
            Total Overtime Amount
          </span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(Number(record.lp_total_ot ?? 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OvertimeTab;
