import { useState } from "react";
import {
  List,
  X,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shared_components/dialog";
import { Button } from "@/components/shared_components/button";
import SummaryTab from "./SummaryTab";
import LeaveTab from "./LeaveTab";
import OvertimeTab from "./OvertimeTab";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { formatDateLong } from "@/helpers/dateUtils";

// ── Types ────────────────────────────────────────────────────────────────────
type TabKey = "summary" | "leave" | "overtime";

interface LastPayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}


// ── Main Dialog ──────────────────────────────────────────────────────────────
const LastPayDialog = ({ isOpen, onOpenChange }: LastPayDialogProps) => {
  const { record } = useLastPayContext();
  const [activeTab, setActiveTab] = useState<TabKey>("summary");
  
  if (!record) return null;

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) setActiveTab("summary");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          <List className="w-3 h-3 mr-1" /> View Details
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl flex flex-col max-h-[93vh] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Last Pay Details
          </DialogTitle>
          <p className="text-sm text-gray-500">
            {formatDateLong(record.employee_start_date)} - {formatDateLong(record.cut_off_end_date)}
          </p>
        </DialogHeader>

        {/* Tab Bar */}
        <div className="grid grid-cols-3 gap-1 px-6 pt-3 flex-shrink-0 border-b border-gray-100">
          {[
            { key: "summary" as const, label: "Summary", icon: FileText },
            { key: "leave" as const, label: "Leave", icon: TrendingUp },
            { key: "overtime" as const, label: "Overtime", icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all -mb-px w-full ${
                activeTab === key
                  ? "border-gray-900 text-gray-900 bg-white"
                  : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeTab === "summary" && <SummaryTab />}
          {activeTab === "leave" && <LeaveTab />}
          {activeTab === "overtime" && <OvertimeTab />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LastPayDialog;
