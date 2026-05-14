import { Button } from "@/components/shared_components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared_components/dialog";
import { formatCurrency } from "@/helpers/currency";
import { LastPayRecord } from "@/types/lastPayTypes";
import { List, X } from "lucide-react";
import { formatDateLong } from "@/helpers/dateUtils";
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

interface Month13Period {
  tm_id: string;
  month: number;
  total_amt: number;
  days_absent: number;
  year?: number;
  period_start_date?: string;
  period_end_date?: string;
}

interface Month13DialogProps {
  record: LastPayRecord;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const Month13Dialog = ({
  record,
  isOpen,
  onOpenChange,
}: Month13DialogProps) => {
  if (!record) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <List className="w-3 h-3 mr-1" /> View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogClose asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogClose>
        <DialogTitle>13th Month Computation</DialogTitle>
        <p className="text-sm text-gray-500">
          {formatDateLong(record.employee_start_date)} - {formatDateLong(record.employee_end_date)}
        </p>
        <div className="space-y-6 text-sm">
          {/* Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Salary Period Breakdown
            </h3>

            <div className="border border-gray-200 shadow-md overflow-hidden">
              <div className="max-h-[45vh] overflow-y-auto">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[50%]" />
                    <col className="w-[50%]" />
                  </colgroup>

                  <thead className="sticky top-0 z-30 bg-gray-100 outline outline-1 outline-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-left">
                        Coverage Period
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-right">
                        Salary Earned
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-100">
                    {record.month13_salary_periods && record.month13_salary_periods.length > 0 ? (
                      [...record.month13_salary_periods]
                        .sort((a, b) => {
                          // Sort by period_start_date if available, otherwise fall back to year/month
                          if (a.period_start_date && b.period_start_date) {
                            return new Date(a.period_start_date).getTime() - new Date(b.period_start_date).getTime();
                          }
                          // Fallback to year/month sorting
                          const yearA = a.year || 0;
                          const yearB = b.year || 0;
                          if (yearA !== yearB) {
                            return yearA - yearB;
                          }
                          return a.month - b.month;
                        })
                        .map((entry: Month13Period) => (
                        <tr
                          key={entry.tm_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 text-gray-900 font-medium">
                            {formatPayrollPeriod(entry.period_start_date, entry.period_end_date, entry.month, entry.year)}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-900 text-right">
                            {formatCurrency(Number(entry.total_amt))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No salary period data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 13th Month Calculation Summary */}
          <div className="bg-green-100 border border-green-300 rounded-xl px-4 py-4 space-y-2">
            <p className="text-sm font-semibold text-green-700 uppercase tracking-wider">
              13th Month Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Basic Salary Earned</span>
              <span className="font-medium">
                {formatCurrency(Number(record.lp_total_tm * 12))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">13th Month Pay (TBSE ÷ 12)</span>
              <span className="font-medium">
                {formatCurrency(Number(record.lp_total_tm ?? 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Already Received</span>
              <span className="font-medium text-red-600">
                ({formatCurrency(Number(0))})
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-300">
              <span className="text-sm font-semibold text-gray-700">
                Remaining 13th Month Amount
              </span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(Number(record.lp_total_tm ?? 0))}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Month13Dialog;
