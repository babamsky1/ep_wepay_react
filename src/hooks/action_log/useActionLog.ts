import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useLastPayContext } from "@/contexts/LastPayContext";
import { formatDateTime } from "@/helpers/dateUtils";
import { formatCurrency } from "@/helpers/currency";
import { GeneralLog } from "@/types/lastPayTypes";
import { FileText, CheckCircle, XCircle, Edit, Trash2, Lock, RefreshCw } from "lucide-react";

interface ActionLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string | null;
  icon: React.ReactNode;
  variant: "default" | "success" | "warning" | "error";
  details?: string;
}

function icon(Component: React.ElementType) {
  return React.createElement(Component, { className: "w-4 h-4" });
}

// Helper: Format field names from snake_case to Title Case
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Employee Log Parser
function parseEmployeeLog(log: GeneralLog): ActionLogEntry {
  let action: string;
  let details: string;
  let entryIcon: React.ReactNode;
  let variant: ActionLogEntry["variant"];

  switch (log.action) {
    case "CREATE":
      action = "Created User";
      const firstName = log.details.first_name || "";
      const lastName = log.details.last_name || "";
      const email = log.details.email || "";
      const role = log.details.role || "";
      details = `Added ${firstName} ${lastName} (${email}) with role ${role}`;
      entryIcon = icon(CheckCircle);
      variant = "success";
      break;
    case "UPDATE":
      action = "Updated User";
      const oldValues = log.details.old_values || {};
      const changes: string[] = [];

      // Only show fields that actually changed
      Object.entries(oldValues).forEach(([field, oldValue]) => {
        const newValue = log.details[field];
        if (oldValue !== newValue) {
          const fieldLabel = formatFieldName(field);
          changes.push(`${fieldLabel}: "${oldValue}" → "${newValue}"`);
        }
      });

      if (log.details.password_changed) {
        changes.push("Password updated");
      }

      const uEmail = log.details.email || oldValues.email || "Unknown";
      if (changes.length > 0) {
        details = `Updated ${uEmail}\n• ${changes.join('\n• ')}`;
      } else {
        details = `Updated ${uEmail} (no changes)`;
      }
      entryIcon = icon(Edit);
      variant = "warning";
      break;
    case "DELETE":
      action = "Deleted User";
      const dEmail = log.details.email || "";
      details = log.details.message || `Deleted ${dEmail}`;
      entryIcon = icon(Trash2);
      variant = "error";
      break;
    default:
      action = log.action;
      details = "User action";
      entryIcon = icon(FileText);
      variant = "default";
  }

  return {
    id: log.log_id,
    action,
    user: log.performed_by,
    timestamp: log.performed_at,
    icon: entryIcon,
    variant,
    details,
  };
}

// Additionals Log Parser
function parseAdditionalsLog(log: GeneralLog): ActionLogEntry {
  const itemType = log.details.addtl_type === "P" ? "Payable" : "Deduction";
  const description = log.details.description || "";
  const amount = Number(log.details.amount ?? 0);
  const oldValues = log.details.old_values || {};
  let action: string;
  let details: string;
  let entryIcon: React.ReactNode;
  let variant: ActionLogEntry["variant"];

  switch (log.action) {
    case "CREATE":
      action = `Created ${itemType}`;
      details = `Added "${description}" with amount ${formatCurrency(amount)}`;
      entryIcon = icon(FileText);
      variant = "success";
      break;
    case "UPDATE": {
      const isConfidentialityChange = log.details.confidentiality_changed;
      const changes: string[] = [];

      // Check each field for actual changes
      if (oldValues.description && oldValues.description !== description) {
        changes.push(`Name: "${oldValues.description}" → "${description}"`);
      }
      if (oldValues.amount && Number(oldValues.amount) !== amount) {
        changes.push(`Amount: ${formatCurrency(Number(oldValues.amount))} → ${formatCurrency(amount)}`);
      }
      if (oldValues.is_confidential !== log.details.is_confidential) {
        const from = oldValues.is_confidential === "Y" ? "Confidential" : "Public";
        const to = log.details.is_confidential === "Y" ? "Confidential" : "Public";
        changes.push(`Visibility: ${from} → ${to}`);
      }

      // Only show specific icon if ONLY confidentiality changed
      if (isConfidentialityChange && changes.length === 1) {
        action = `Updated ${itemType} (Confidentiality)`;
        entryIcon = icon(Lock);
      } else {
        action = `Updated ${itemType}`;
        entryIcon = icon(Edit);
      }

      details = changes.length > 0
        ? `${description}\n• ${changes.join('\n• ')}`
        : `Updated "${description}" (no changes)`;
      variant = "warning";
      break;
    }
    case "DELETE":
      action = `Deleted ${itemType}`;
      details = `Removed "${description}" (${formatCurrency(amount)})`;
      entryIcon = icon(Trash2);
      variant = "error";
      break;
    default:
      action = log.action;
      details = `${itemType} action`;
      entryIcon = icon(FileText);
      variant = "default";
  }

  return {
    id: log.log_id,
    action,
    user: log.performed_by,
    timestamp: log.performed_at,
    icon: entryIcon,
    variant,
    details,
  };
}

// LastPayRecord Log Parser
const STATUS_ACTIONS: Record<string, { action: string; icon: React.ElementType; variant: ActionLogEntry["variant"] }> = {
  FINALIZED:    { action: "Record Finalized",    icon: CheckCircle, variant: "success" },
  APPROVED:     { action: "Record Approved",     icon: CheckCircle, variant: "success" },
  RELEASED:     { action: "Record Released",     icon: CheckCircle, variant: "success" },
  DISAPPROVED:  { action: "Record Disapproved",  icon: XCircle,     variant: "error"   },
  REOPENED:     { action: "Record Reopened",     icon: RefreshCw,   variant: "warning" },
  DELETE:       { action: "Record Deleted",      icon: Trash2,      variant: "error"   },
  GENERATED:    { action: "Record Generated",    icon: FileText,    variant: "default" },
};

const PREV_STATUS: Record<string, string> = {
  FINALIZED:   "PENDING",
  APPROVED:    "FINALIZED",
  DISAPPROVED: "FINALIZED",
  RELEASED:    "APPROVED",
};

function parseLastPayRecordLog(log: GeneralLog): ActionLogEntry {
  const config = STATUS_ACTIONS[log.action] ?? {
    action: log.action,
    icon: FileText,
    variant: "default" as const,
  };

  if (log.action === "GENERATED") {
    return {
      id: log.log_id,
      action: config.action,
      user: log.performed_by,
      timestamp: log.performed_at,
      icon: icon(config.icon),
      variant: config.variant,
    };
  }

  let details = "";
  if (log.details.ref_no) {
    const newStatus = log.details.new_status || log.details.current_status || log.details.to_status;
    let oldStatus = log.details.old_status || log.details.previous_status || log.details.from_status;
    if ((!oldStatus || oldStatus === newStatus) && newStatus) {
      oldStatus = PREV_STATUS[log.action] ?? "UNKNOWN";
    }
    // Only show status change if it actually changed
    if (oldStatus && newStatus && oldStatus !== newStatus) {
      details = `Status: ${oldStatus} → ${newStatus}`;
    } else if (log.details.status_change) {
      details = log.details.status_change;
    }
  } else {
    details = log.details.status_change || "";
  }

  return {
    id: log.log_id,
    action: config.action,
    user: log.performed_by,
    timestamp: log.performed_at,
    icon: icon(config.icon),
    variant: config.variant,
    details,
  };
}

// API-based Action Log Hook (consolidated)
export function useActionLog(tableName: 'Employee' | 'TimesheetRecord', parser: (log: GeneralLog) => ActionLogEntry, enabled: boolean = true, page = 1, page_size = 25) {
  const { data: logs = [], isLoading, error } = useQuery({
    queryKey: ["actionLog", tableName, page, page_size],
    queryFn: async () => {
      const response = await api.generalLogs.list({ table_name: tableName, page, page_size });
      return response.data || [];
    },
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const actionLogEntries = useMemo((): ActionLogEntry[] => {
    return logs.map(parser);
  }, [logs, parser]);

  return { actionLogEntries, formatDateTime, isLoading, error: error?.message || null };
}

// LastPay Action Log Hook (Context-based)
export function useLastPayActionLog() {
  const context = useLastPayContext();
  const record = context?.record;

  const actionLogEntries = useMemo((): ActionLogEntry[] => {
    if (!record) return [];
    const entries: ActionLogEntry[] = [];
    const allLogs = [
      ...(record.status_logs ?? []),
      ...(record.audit_logs ?? []),
    ];

    allLogs.forEach((log: GeneralLog) => {
      if (log.table_name === "AdditionalsType") {
        entries.push(parseAdditionalsLog(log));
      } else if (log.table_name === "LastPayRecord") {
        entries.push(parseLastPayRecordLog(log));
      } else if (log.table_name === "Employee") {
        entries.push(parseEmployeeLog(log));
      } else {
        entries.push({
          id: log.log_id,
          action: `${log.table_name} — ${log.action}`,
          user: log.performed_by,
          timestamp: log.performed_at,
          icon: icon(FileText),
          variant: "default",
          details: JSON.stringify(log.details),
        });
      }
    });

    return entries.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [record]);

  return { actionLogEntries, formatDateTime };
}

// Timesheet Log Parser
function parseTimesheetLog(log: GeneralLog, timesheet_id?: string): ActionLogEntry {
  let action: string;
  let details: string;
  let entryIcon: React.ReactNode;
  let variant: ActionLogEntry["variant"];

  switch (log.action) {
    case "CREATE":
      action = "Uploaded Timesheet";
      const tsId = log.details.timesheet_id || timesheet_id || "Unknown";
      const empName = log.details.employee_name || "Unknown";
      const totalDays = log.details.total_days_worked || 0;
      const validEntries = log.details.valid_entries || 0;
      details = `Uploaded timesheet ${tsId} for ${empName}\n• Total days worked: ${totalDays}\n• Valid entries: ${validEntries}`;
      entryIcon = icon(CheckCircle);
      variant = "success";
      break;
    case "DELETE":
      action = "Deleted Timesheet";
      const delEmpName = log.details.employee_name || "Unknown";
      const delEmpId = log.details.employee_id || "Unknown";
      const deletedCount = log.details.deleted_records || 0;
      details = log.details.message || `Deleted ${deletedCount} timesheet records for ${delEmpName} (${delEmpId})`;
      entryIcon = icon(Trash2);
      variant = "error";
      break;
    case "UPDATE":
      action = "Updated Timesheet";
      const oldValues = log.details.old_values || {};
      const uTsId = log.details.timesheet_id || timesheet_id || "Unknown";
      const uEmpName = log.details.employee_name || "Unknown";
      const changes: string[] = [];

      // Only show fields that actually changed
      Object.entries(oldValues).forEach(([field, oldValue]) => {
        const newValue = log.details[field];
        if (oldValue !== newValue) {
          const fieldLabel = formatFieldName(field);
          changes.push(`${fieldLabel}: ${oldValue} → ${newValue}`);
        }
      });

      details = changes.length > 0
        ? `Updated timesheet ${uTsId} for ${uEmpName}\n• ${changes.join('\n• ')}`
        : `Updated timesheet ${uTsId} for ${uEmpName}`;
      entryIcon = icon(Edit);
      variant = "warning";
      break;
    default:
      action = log.action;
      details = `Timesheet ${timesheet_id || "Unknown"}: ${JSON.stringify(log.details)}`;
      entryIcon = icon(FileText);
      variant = "default";
  }

  return {
    id: log.log_id,
    action,
    user: log.performed_by,
    timestamp: log.performed_at,
    icon: entryIcon,
    variant,
    details,
  };
}

// Timesheet Action Log Hook (API-based) - Lazy-loaded with caching
export function useTimesheetActionLogLazy(enabled: boolean = false, page = 1, page_size = 25) {
  return useActionLog('TimesheetRecord', parseTimesheetLog, enabled, page, page_size);
}

// Employee Action Log Hook (API-based) - Lazy-loaded with caching
export function useEmployeeActionLogLazy(enabled: boolean = false, page = 1, page_size = 25) {
  return useActionLog('Employee', parseEmployeeLog, enabled, page, page_size);
}