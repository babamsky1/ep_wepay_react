import { formatCurrency } from "@/helpers/currency";
import { formatDateLong } from "@/helpers/dateUtils";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { getMonthName } from "@/helpers/dateUtils";

// Helper function to format payroll period range
const formatPayrollPeriod = (startDate?: string, endDate?: string, month?: number, year?: number) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const startYear = start.getFullYear();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endYear = end.getFullYear();
    
    // Always show both start and end years, and separate entries even if same month
    return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
  }
  // Fallback to month/year if no period dates
  return month && year ? `${getMonthName(month)} ${year}` : 'N/A';
};

export default function LastWagesForm() {
  const { record: data } = useLastPayContext();

  const sortedPeriods = (data?.month13_salary_periods ?? []).sort((a, b) => {
    // Compare by year first
    const yearA = a.year ?? 0;
    const yearB = b.year ?? 0;
    if (yearA !== yearB) return yearA - yearB;

    // Then compare by month number (1-12)
    const monthA = a.month ?? 0;
    const monthB = b.month ?? 0;
    return monthA - monthB;
  });

  return (
    <div className="min-h-screen py-8 px-4 font-mono">
      <div
        className="w-full shadow-2xl border border-black"
        style={{ maxWidth: 900 }}
      >
        <div className="px-5 pt-4 pb-6">
          {/* ── HEADER FIELDS ── */}
          <table className="w-full mb-2.5 border-collapse">
            <tbody>
              <tr>
                <td className="text-xs font-semibold px-1.5 pb-0 pt-1 w-20 whitespace-nowrap align-bottom">
                  NAME:
                </td>
                <td className="text-xs px-1.5 pb-0 pt-1 w-72 align-bottom border-b border-black">
                  <div className="h-4 text-xs">{data?.emp_name || "N/A"}</div>
                </td>
                <td className="w-5" />
                <td className="text-xs font-semibold px-1.5 pb-0 pt-1 whitespace-nowrap w-36 align-bottom">
                  DATE SEPARATED:
                </td>
                <td className="text-xs px-1.5 pb-0 pt-1 w-28 align-bottom border-b border-black">
                  <div className="h-4 text-xs">
                    {data?.employee_end_date
                      ? formatDateLong(data.employee_end_date)
                      : "N/A"}
                  </div>
                </td>
              </tr>
              <tr>
                <td className="text-xs font-semibold px-1.5 pb-0 pt-2 whitespace-nowrap align-bottom">
                  Dept. & Position:
                </td>
                <td
                  className="text-xs px-1.5 pb-0 pt-2 align-bottom border-b border-black"
                  colSpan={1}
                >
                  <div className="h-4 text-xs">{data?.position || "N/A"}</div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── MAIN TWO-COLUMN BODY ── */}
          <div className="flex gap-10 items-start">
            {/* ══ LEFT COLUMN ══ */}
            <div className="flex-none" style={{ width: 320 }}>
              {/* Salary Grid */}
              <table className="w-full border border-black border-collapse">
                <thead>
                  <tr>
                    <th
                      className="text-xs font-semibold text-center px-1 py-1.5 border border-black font-mono"
                      style={{ width: 28 }}
                    >
                      #
                    </th>
                    <th
                      className="text-xs font-semibold text-center px-1 py-1.5 border border-black font-mono"
                      style={{ width: 170 }}
                    >
                      Period Covered
                    </th>
                    <th
                      className="text-xs font-semibold text-center px-1 py-1.5 border border-black font-mono"
                      style={{ width: 110 }}
                    >
                      Salary Earned
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 12 }, (_, i) => {
                    const period = sortedPeriods[i];
                    return (
                      <tr key={period?.tm_id ?? i}>
                        <td className="text-center text-xs px-1 py-0.5 border border-black text-gray-600">
                          {i + 1}
                        </td>
                        <td className="text-xs px-1.5 py-0.5 border border-black">
                          {period
                            ? formatPayrollPeriod(period.period_start_date, period.period_end_date, period.month, period.year)
                            : ""}
                        </td>
                        <td className="text-right text-xs px-1.5 py-0.5 border border-black">
                          {period ? formatCurrency(Number(period.total_amt)) : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Totals */}
              <table className="w-full mt-1 border-collapse border-spacing-0">
                <tbody>
                  <tr>
                    <td
                      className="text-xs font-semibold px-1.5 w-48"
                      style={{ borderBottom: "4px double black" }}
                    >
                      Total Salary Earned
                    </td>
                    <td
                      className="text-xs text-right font-bold px-1.5 w-24"  
                      style={{ borderBottom: "4px double black" }}
                    >
                      {formatCurrency(Number(data.accumulated_13th_month_computed || 0))}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} style={{ height: 12 }} />
                  </tr>
                  <tr>
                    <td
                      className="text-xs font-semibold px-1.5 w-48"
                      style={{ borderBottom: "4px double black" }}
                    >
                      13th Month Pay
                    </td>
                    <td
                      className="text-xs text-right font-bold px-1.5 w-24"
                      style={{ borderBottom: "4px double black" }}
                    >
                      {formatCurrency(Number(data.lp_total_tm ?? 0))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* PRIME */}
              <table className="w-full mt-2 border-collapse">
                <tbody>
                  <tr>
                    <td className="text-xs font-semibold px-1.5 w-48">PRIME</td>
                    <td className="text-xs text-right px-1.5 border-b border-black w-24" />
                  </tr>
                  <tr>
                    <td className="text-xs font-semibold px-1.5 w-48">
                      PRIME OFFICE ATM
                    </td>
                    <td className="text-xs text-right px-1.5 border-b border-black w-24" />
                  </tr>
                  <tr>
                    <td className="text-xs font-semibold px-1.5 w-48">
                      LAST SALARY DEFERRED
                    </td>
                    <td className="text-xs text-right px-1.5 border-b border-black w-24" />
                  </tr>
                </tbody>
              </table>

              {/* Hired / Status / Last Duty */}
              <table className="w-full mt-1 border-collapse">
                <tbody>
                  <tr>
                    <td className="text-xs font-semibold px-1.5 w-28">
                      HIRED DATE
                    </td>
                    <td className="text-xs px-1.5 text-right border-b border-black">
                      {data?.employee_start_date
                        ? formatDateLong(data.employee_start_date)
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs font-semibold px-1.5 w-28">
                      STATUS
                    </td>
                    <td className="text-xs px-1.5 text-right border-b border-black">
                      {data?.emp_status || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs font-semibold px-1.5 w-28">
                      LAST DUTY
                    </td>
                    <td className="text-xs px-1.5 text-right border-b border-black">
                      {data?.employee_end_date
                        ? formatDateLong(data.employee_end_date)
                        : "N/A"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ══ RIGHT COLUMN ══ */}
            <div className="flex-1 min-w-[370px]">
              {/* Wages Summary */}
              <table className="w-full border-collapse border-spacing-0">
                <tbody>
                  <tr>
                    <td
                      colSpan={2}
                      className="text-xs font-semibold tracking-wider py-1.5 px-2 underline"
                    >
                      SALARIES AND OTHER WAGES
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs px-1.5">Last Salaries:</td>
                    <td className="text-xs text-right px-1.5 border-b border-black w-32">
                      {formatCurrency(Number(data.last_pay ?? 0))}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-xs px-1.5">13th Month Pay</td>
                    <td className="text-xs text-right px-1.5 border-b border-black w-32">
                      {formatCurrency(Number(data.lp_total_tm || 0))}
                    </td>
                  </tr>
                  {/* Line Item Payables */}
                  {data?.payables && data.payables.length > 0 && (
                    <>
                      {data.payables.map((payable, index) => (
                        <tr key={payable.ad_type_id || index}>
                          <td className="text-xs px-1.5">
                            {payable.description}
                          </td>
                          <td className="text-xs text-right px-1.5 border-b border-black w-32">
                            {formatCurrency(Number(payable.amount))}
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                  <tr className="border-t border-b border-black">
                    <td className="text-xs font-semibold px-1.5 pt-2">
                      Gross Amount
                    </td>
                    <td className="text-xs text-right font-bold px-1.5 pt-2 border-b border-black w-32">
                      {formatCurrency(Number(data.gross_amount_computed ?? 0))}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Deductions */}
              <div className="mt-2">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td
                        colSpan={2}
                        className="text-xs font-semibold tracking-wider py-1.5 px-2"
                      >
                        DEDUCTIONS
                      </td>
                    </tr>
                    {data?.deductions && data.deductions.length > 0 && (
                      <>
                        {data.deductions.map((deduction, index) => (
                          <tr key={deduction.ad_type_id || index}>
                            <td className="text-xs px-1.5">
                              {deduction.description}
                            </td>
                            <td className="text-xs text-right px-1.5 border-b border-black w-32">
                              {formatCurrency(Number(deduction.amount))}
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                    {data.total_loan_balance_computed > 0 && (
                      <tr>
                        <td className="text-xs px-1.5">Loans</td>
                        <td className="text-xs text-right px-1.5 border-b border-black w-32">
                          {formatCurrency(data.total_loan_balance_computed)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Net Amount Due */}
              <div className="mt-6">
                <table className="w-full border-t border-black border-collapse border-spacing-0">
                  <tbody>
                    <tr>
                      <td
                        className="text-sm font-bold px-1.5 py-2"
                        style={{ borderBottom: "4px double black" }}
                      >
                        NET AMOUNT DUE
                      </td>
                      <td
                        className="text-sm font-bold text-right px-1.5 py-2"
                        style={{ borderBottom: "4px double black" }}
                      >
                        {formatCurrency(Number(data.net_pay ?? 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* ── SIGNATURE SECTION ── */}
              <div className="mt-4">
                <div className="items-left" style={{ minWidth: 120 }}>
                  <div className="text-xs font-semibold text-left mt-0.5">
                    Prepared by:
                  </div>
                  <div className="text-xs text-left w-full pb-0.5 mt-6">
                    {data.created_by || "N/A"}
                  </div>
                </div>
                <div className="items-left" style={{ minWidth: 120 }}>
                  <div className="h-10 w-full" />
                  <div className="text-xs font-semibold text-left mt-0.5">
                    Checked by:
                  </div>
                  <div className="text-xs text-left w-full pb-0.5 mt-6">
                    Ma. Cristina Isip
                  </div>
                </div>
                <div className="items-left" style={{ minWidth: 120 }}>
                  <div className="h-10 w-full" />
                  <div className="text-xs font-semibold text-left mt-0.5">
                    Approved by:
                  </div>
                  <div className="text-xs text-left w-full pb-0.5 mt-6">
                    Michael Siytaoco
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
