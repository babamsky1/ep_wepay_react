import { Button } from "@/components/shared_components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared_components/dialog";
import { formatCurrency } from "@/helpers/currency";
import { formatDateLong } from "@/helpers/dateUtils";
import { useLastPayContext } from "@/contexts/LastPayContext";
import {  X, List} from "lucide-react";

interface LoanDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoanDialog = ({ isOpen, onOpenChange }: LoanDialogProps) => {
  const { record } = useLastPayContext();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <List className="w-3 h-3 mr-1" /> View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
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
        <DialogTitle>Loan Details</DialogTitle>
        <p className="text-sm text-gray-500">
          {formatDateLong(record.employee_start_date)} - {formatDateLong(record.employee_end_date)}
        </p>

        <div className="space-y-6 text-sm">
          {/* Loan Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              Loan Breakdown
            </h3>

            <div className="border border-gray-200 shadow-md overflow-hidden">
              <div className="max-h-[45vh] overflow-y-auto">
                <table className="w-full table-fixed text-sm">
                  <colgroup>
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                    <col className="w-[25%]" />
                  </colgroup>

                  <thead className="sticky top-0 z-30 bg-gray-100 outline outline-1 outline-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-left">
                        Loan Type
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-right">
                        Total
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-right">
                        Paid
                      </th>
                      <th className="px-4 py-2 text-xs font-medium text-gray-600 uppercase tracking-wider text-right">
                        Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-100">
                    {record.loans && record.loans.length > 0 ? (
                      record.loans.map((loan, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 text-gray-900 font-medium">
                            {loan.loan_description}
                          </td>
                          <td className="px-4 py-2 text-gray-700 text-right">
                            {formatCurrency(Number(loan.loan_amt))}
                          </td>
                          <td className="px-4 py-2 text-gray-700 text-right">
                            {formatCurrency(Number(loan.paid_amt || 0))}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-900 text-right">
                            {formatCurrency(Number(loan.balance_amt || 0))}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-gray-400"
                        >
                          No loan entries available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-4 space-y-2">
            <p className="text-sm font-semibold text-red-700 uppercase tracking-wider">
              Loan Summary
            </p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Original Loans</span>
              <span className="font-medium">
                {formatCurrency(Number(record.loans?.reduce((sum, loan) => sum + Number(loan.loan_amt || 0), 0) ?? 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Amount Paid</span>
              <span className="font-medium">
                {formatCurrency(Number(record.loans?.reduce((sum, loan) => sum + Number(loan.paid_amt || 0), 0) ?? 0))}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-red-200">
              <span className="text-sm font-semibold text-gray-700">
                Remaining Loan Balance
              </span>
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(Number(record.loans?.reduce((sum, loan) => sum + Number(loan.balance_amt || 0), 0) ?? 0))}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoanDialog;