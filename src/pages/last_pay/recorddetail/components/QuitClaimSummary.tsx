import { useState } from "react";
import { formatCurrency } from "@/helpers/currency";
import { Calculator, DollarSign, X, Calendar, CreditCard } from "lucide-react";
import LastPayDialog from "./LastPayDialog";
import LoanDialog from "./LoanDialog";
import Month13Dialog from "./Month13Dialog";
import { useLastPayContext } from "@/contexts/LastPayContext";

// ─── Quit Claim Summary ────────────────────────────────────────────────────────

export function QuitClaimSummary() {
  const [openDialog, setOpenDialog] = useState<'lastPay' | 'month13' | 'loan' | null>(null);

  const { record, disapproveRemark } = useLastPayContext();

  return (
    <div className="border border-border rounded-xl bg-card flex flex-col h-auto max-h-[81vh] shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-900 px-4 py-4 flex-shrink-0 rounded-t-xl">
        <h3 className="font-bold text-white text-lg uppercase tracking-wide drop-shadow-md">
          Quit Claim Summary
        </h3>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden p-3 min-h-0 bg-gradient-to-b from-gray-50/50 to-white">
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 px-1 pb-1">
          {/* Last Pay */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-md hover:shadow-lg transition-all duration-200 hover:border-emerald-300">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-gray-900">
                    Last Pay
                  </h4>
                  <p className="text-xs text-gray-500">Base compensation</p>
                </div>
              </div>
              <LastPayDialog
                isOpen={openDialog === 'lastPay'}
                onOpenChange={(open) => setOpenDialog(open ? 'lastPay' : null)}
              />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-600">Amount</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(Number(record.last_pay || 0))}
              </span>
            </div>
          </div>

          {/* 13th Month */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-md hover:shadow-lg transition-all duration-200 hover:border-emerald-300">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-gray-900">
                    13th Month Pay
                  </h4>
                  <p className="text-xs text-gray-500">Additional benefit</p>
                </div>
              </div>
              <Month13Dialog
                record={record}
                isOpen={openDialog === 'month13'}
                onOpenChange={(open) => setOpenDialog(open ? 'month13' : null)}
              />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-600">
                Remaining balance
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {formatCurrency(Number(record.lp_total_tm ?? 0))}
              </span>
            </div>
          </div>

          {/* Loans */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-300">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-gray-900">
                    Loans
                  </h4>
                  <p className="text-xs text-gray-500">Outstanding balance</p>
                </div>
              </div>
              <LoanDialog
                isOpen={openDialog === 'loan'}
                onOpenChange={(open) => setOpenDialog(open ? 'loan' : null)}
              />
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm font-medium text-gray-600">
                Total Balance
              </span>
              <span className="text-lg font-semibold text-red-600">
                {formatCurrency(Number(record.lp_total_loan_balance ?? 0))}
              </span>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1 shadow-md hover:shadow-lg transition-all duration-200 hover:border-emerald-300">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-gray-900">
                    Summary
                  </h4>
                  <p className="text-xs text-gray-500">Complete breakdown</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  Last Pay
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(record.last_pay ?? 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">
                  13th Month
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(record.lp_total_tm ?? 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    Additional Pay
                  </span>
                </div>
                <span className="text-base font-semibold text-gray-900">
                  {formatCurrency(Number(record.total_payables_computed ?? 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">
                    Deductions
                  </span>
                </div>
                <span className="text-base font-semibold text-red-500">
                  (
                  {formatCurrency(Number(record.total_deductions_computed ?? 0))}
                  )
                </span>
              </div>
              {/* <div className="flex justify-between items-center py-1 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-600">Loans</span>
                </div>
                <span className="text-base font-semibold text-red-500">
                  ({formatCurrency(Number(record.total_loans ?? 0))})
                </span>
              </div> */}
            </div>

            <div className="pt-1">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    Final Pay
                  </span>
                </div>
                <span className="text-3xl font-bold font-mono text-gray-900">
                  {formatCurrency(Number(record.net_pay ?? 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Disapproval Remark */}
          {disapproveRemark && (
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:border-red-300">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h4 className="font-semibold text-base text-gray-900">
                    Disapproval Remark
                  </h4>
                  <p className="text-xs text-gray-500 mb-1">Review required</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {disapproveRemark}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
