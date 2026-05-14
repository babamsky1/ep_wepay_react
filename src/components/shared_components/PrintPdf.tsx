import { ChevronRight, Receipt, FileText, X, Grid3X3 } from "lucide-react";
import { Button } from "./button";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import PaymentVoucher from "../../pages/last_pay/recorddetail/printing/PaymentVoucher";
import AcknowledgmentInHouse from "../../pages/last_pay/recorddetail/printing/AcknowledgmentInHouse";
import AcknowledgmentPromo from "../../pages/last_pay/recorddetail/printing/AcknowledgmentPromo";
import LastWagesForm from "../../pages/last_pay/recorddetail/printing/LastWagesForm";
import SpreadsheetGrid from "../../pages/last_pay/recorddetail/printing/VoucherData";
import { LastPayRecord } from "@/types/lastPayTypes";

interface PrintPdfProps {
  isOpen: boolean;
  onClose: () => void;
  data?: LastPayRecord;
  currentStatus?: string;
}

const PrintPdf = ({ isOpen, onClose, data }: PrintPdfProps) => {
  const paymentVoucherRef = useRef<HTMLDivElement>(null);
  const acknowledgmentInHouseRef = useRef<HTMLDivElement>(null);
  const acknowledgmentPromoRef = useRef<HTMLDivElement>(null);
  const lastWagesFormRef = useRef<HTMLDivElement>(null);
  const spreadsheetGridRef = useRef<HTMLDivElement>(null);

  const handlePrintPaymentVoucher = useReactToPrint({
    contentRef: paymentVoucherRef,
    documentTitle: `Payment Voucher - ${data?.ref_no ?? ""}`,
  });

  const handlePrintAcknowledgmentInHouse = useReactToPrint({
    contentRef: acknowledgmentInHouseRef,
    documentTitle: `Quit Claim Acknowledgment - ${data?.ref_no ?? ""}`,
  });

  const handlePrintAcknowledgmentPromo = useReactToPrint({
    contentRef: acknowledgmentPromoRef,
    documentTitle: `Quit Claim Acknowledgment - ${data?.ref_no ?? ""}`,
  });

  const handlePrintLastWagesForm = useReactToPrint({
    contentRef: lastWagesFormRef,
    documentTitle: `Last Wages Form - ${data?.ref_no ?? ""}`,
  });

  const handlePrintSpreadsheetGrid = useReactToPrint({
    contentRef: spreadsheetGridRef,
    documentTitle: "Spreadsheet Grid",
  });

  const printOptions = [
    {
      id: 0,
      title: "Payment Voucher",
      icon: Receipt,
      handler: handlePrintPaymentVoucher,
    },
    {
      id: 1,
      title: "Quit Claim Acknowledgement - In House",
      icon: FileText,
      handler: handlePrintAcknowledgmentInHouse,
    },
    {
      id: 2,
      title: "Quit Claim Acknowledgement - Promodiser",
      icon: FileText,
      handler: handlePrintAcknowledgmentPromo,
    },
    {
      id: 3,
      title: "Last Wages Form",
      icon: FileText,
      handler: handlePrintLastWagesForm,
    },
    {
      id: 4,
      title: "Spreadsheet Grid",
      icon: Grid3X3,
      handler: handlePrintSpreadsheetGrid,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-md shadow-lg w-full max-w-lg mx-4">
        {/* Dark Green Header */}
        <div className="bg-green-800 text-white p-4 rounded-t-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">PRINT OPTIONS</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-white hover:bg-green-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {printOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={option.handler}
                className="w-full p-4 rounded-md border flex items-center justify-between transition-all bg-white border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-md mr-3 bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-700">
                    {option.title}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Hidden printable content — off-screen so refs are always mounted */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div ref={paymentVoucherRef}>
          <PaymentVoucher />
        </div>
        <div ref={acknowledgmentInHouseRef}>
          <AcknowledgmentInHouse />
        </div>
        <div ref={acknowledgmentPromoRef}>
          <AcknowledgmentPromo />
        </div>
        <div ref={lastWagesFormRef}>
          <LastWagesForm />
        </div>
        <div ref={spreadsheetGridRef}>
          <SpreadsheetGrid />
        </div>
      </div>
    </div>
  );
};

export default PrintPdf;
