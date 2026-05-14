import { Button } from "@/components/shared_components/button";
import { useAllRecords } from "@/hooks/data_fetching/quit-claim/useLastPayRecords";
import { formatCurrency } from "@/helpers/currency";
import type { LastPayRecord } from "@/types/lastPayTypes";
import {
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  AlertCircle,
  XCircle,
  TrendingUp,
  BarChart2,
  InboxIcon,
  FileDown,
  CalendarRange,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateLong } from "@/helpers/dateUtils";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    icon: <Clock className="h-3 w-3" />,
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-blue-100",
    text: "text-blue-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  RELEASED: {
    label: "Released",
    bg: "bg-green-100",
    text: "text-green-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  FINALIZED: {
    label: "Finalized",
    bg: "bg-purple-100",
    text: "text-purple-800",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  DISAPPROVED: {
    label: "Disapproved",
    bg: "bg-red-100",
    text: "text-red-800",
    icon: <XCircle className="h-3 w-3" />,
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  className,
  title,
  value,
  icon: Icon,
  description,
  accent,
}: {
  className?: string;
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  accent?: string;
}) => (
  <div
    className={`relative rounded-xl border bg-card p-5 shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 ${className}`}
  >
    {accent && (
      <div
        className={`absolute top-0 left-0 h-1 w-full rounded-t-xl ${accent}`}
      />
    )}
    <div className="flex items-start justify-between gap-2 mt-1">
      <div className="space-y-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">
          {title}
        </p>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {Icon && (
        <div className="shrink-0 h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = ({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}) => (
  <div className="flex flex-col items-center justify-center h-[250px] gap-3 text-muted-foreground">
    <Icon className="h-10 w-10 opacity-20" />
    <p className="text-sm">{message}</p>
  </div>
);

// ─── Date Range Filter Bar ────────────────────────────────────────────────────
const DateRangeFilter = ({
  from,
  to,
  onFromChange,
  onToChange,
  onClear,
  isActive,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onClear: () => void;
  isActive: boolean;
}) => (
  <div className="flex items-center gap-2 flex-wrap">
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <CalendarRange className="h-4 w-4" />
      <span className="font-medium">Date Range:</span>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onToChange(e.target.value)}
        className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
      />
    </div>
    {isActive && (
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1 h-9 px-3 text-xs font-medium text-muted-foreground border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors"
      >
        <X className="h-3 w-3" />
        Clear
      </button>
    )}
  </div>
);

// ─── CSV Export Helper ────────────────────────────────────────────────────────
function downloadCSV(filename: string, rows: string[][], headers: string[]) {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(","),
    ...rows.map((r) => r.map(escape).join(",")),
  ].join("\r\n");
  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Dashboard = () => {
  // Global date range filter
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const isFilterActive = Boolean(filterFrom || filterTo);

  // Export modal state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const { data, isLoading, isError, error } = useAllRecords();
  const records: LastPayRecord[] = useMemo(() => data ?? [], [data]);

  // ── Filtered Records (for metrics + charts, NOT recent claims) ─────────────
  const filteredRecords = useMemo(() => {
    if (!isFilterActive) return records;
    const fromD = filterFrom ? new Date(filterFrom) : null;
    const toD = filterTo ? new Date(filterTo + "T23:59:59") : null;
    return records.filter((r) => {
      const dateStr = r.created_at || r.updated_at;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
      return true;
    });
  }, [records, filterFrom, filterTo, isFilterActive]);

  // ── Metrics ────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const byStatus = (status: string) =>
      filteredRecords.filter((r) => r.lp_status === status).length;

    const sumByStatus = (...statuses: string[]) =>
      filteredRecords
        .filter((r) => statuses.includes(r.lp_status))
        .reduce((sum, r) => {
          const val = Math.trunc(Number(r.net_pay));
          return sum + (Number.isFinite(val) && val > 0 ? val : 0);
        }, 0);

    return {
      pendingClaims: byStatus("PENDING"),
      approvedClaims: byStatus("APPROVED"),
      releasedClaims: byStatus("RELEASED"),
      finalizedClaims: byStatus("FINALIZED"),
      disapprovedClaims: byStatus("DISAPPROVED"),
      totalReleasedAmount: sumByStatus("RELEASED"),
      totalPendingAmount: sumByStatus("PENDING", "FINALIZED", "APPROVED"),
    };
  }, [filteredRecords]);

  // ── Audit Trail ────────────────────────────────────────────────────────────
  const auditEvents = useMemo(() => {
    return records
      .filter((r) => r.updated_at)
      .map((r) => ({
        ref_no: r.ref_no || "—",
        emp_id: r.emp_id || "—",
        dept: r.dept_name || "Unknown",
        status: r.lp_status,
        changedAt: r.updated_at!,
        amount: (() => {
          const v = Math.trunc(Number(r.net_pay));
          return Number.isFinite(v) && v > 0 ? v : 0;
        })(),
        actor: r.update_by || "System",
      }))
      .sort(
        (a, b) =>
          new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime(),
      );
  }, [records]);

  // ── Exit Trends (X axis: smart label based on date range span) ─────────────
  const exitTrends = useMemo(() => {
    const MONTHS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const fromD = filterFrom ? new Date(filterFrom) : null;
    const toD = filterTo ? new Date(filterTo + "T23:59:59") : null;

    // Determine the span to decide x-axis granularity
    const scopedRecords = filteredRecords.filter((r) => r.created_at);

    if (scopedRecords.length === 0) {
      return MONTHS.map((month) => ({ label: month, exits: 0 }));
    }

    // Figure out the year span of filtered data
    const years = scopedRecords.map((r) =>
      new Date(r.created_at!).getFullYear(),
    );
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearSpan = maxYear - minYear;

    // Multi-year: group by "Jan 2023", "Feb 2023", etc. (or just by year if span > 3)
    if (yearSpan > 3) {
      // Group by year only
      const yearData: Record<number, number> = {};
      for (let y = minYear; y <= maxYear; y++) yearData[y] = 0;
      scopedRecords.forEach((r) => {
        const y = new Date(r.created_at!).getFullYear();
        yearData[y] = (yearData[y] || 0) + 1;
      });
      return Object.entries(yearData)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([year, exits]) => ({ label: year, exits }));
    }

    if (yearSpan > 0) {
      // Group by "Mon YYYY"
      const buckets: Record<string, number> = {};
      scopedRecords.forEach((r) => {
        const d = new Date(r.created_at!);
        const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
        buckets[key] = (buckets[key] || 0) + 1;
      });
      // Build ordered sequence from minYear Jan to maxYear Dec
      const result: { label: string; exits: number }[] = [];
      for (let y = minYear; y <= maxYear; y++) {
        const startM = y === minYear && fromD ? fromD.getMonth() : 0;
        const endM = y === maxYear && toD ? toD.getMonth() : 11;
        for (let m = startM; m <= endM; m++) {
          const key = `${MONTHS[m]} ${y}`;
          result.push({ label: key, exits: buckets[key] || 0 });
        }
      }
      return result;
    }

    // Single year: group by month only
    const monthData: Record<string, number> = Object.fromEntries(
      MONTHS.map((m) => [m, 0]),
    );
    scopedRecords.forEach((r) => {
      const month = MONTHS[new Date(r.created_at!).getMonth()];
      monthData[month] += 1;
    });
    return MONTHS.map((month) => ({ label: month, exits: monthData[month] }));
  }, [filteredRecords, filterFrom, filterTo]);

  // ── Top 5 Departments ──────────────────────────────────────────────────────
  const departmentClaims = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach((record) => {
      const dept = record.dept_name || "Unknown";
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredRecords]);

  // ── Recent Claims (always uses ALL records, unaffected by filter) ──────────
  const recentClaims = useMemo(() => {
    return records
      .map((record) => {
        let lastActionBy = record.created_by || "System";
        let lastActionAt = record.created_at || "";

        if (record.lp_status === "RELEASED" && record.released_at) {
          lastActionBy = record.released_by || "System";
          lastActionAt = record.released_at;
        } else if (record.lp_status === "FINALIZED" && record.finalized_at) {
          lastActionBy = record.finalized_by || "System";
          lastActionAt = record.finalized_at;
        } else if (record.lp_status === "APPROVED" && record.approved_at) {
          lastActionBy = record.approved_by || "System";
          lastActionAt = record.approved_at;
        } else if (
          record.lp_status === "DISAPPROVED" &&
          record.disapproved_at
        ) {
          lastActionBy = record.disapproved_by || "System";
          lastActionAt = record.disapproved_at;
        }

        return {
          emp_id: record.emp_id,
          department: record.dept_name || "Unknown",
          status: record.lp_status,
          amount: (() => {
            const v = Math.trunc(Number(record.net_pay));
            return Number.isFinite(v) && v > 0 ? v : 0;
          })(),
          generationDate: record.created_at || "",
          ref_no: record.ref_no,
          lastActionBy,
          lastActionAt,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.lastActionAt).getTime() -
          new Date(a.lastActionAt).getTime(),
      )
      .slice(0, 5);
  }, [records]);

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const fromD = exportFrom ? new Date(exportFrom) : null;
    const toD = exportTo ? new Date(exportTo + "T23:59:59") : null;

    const isWithinRange = (dateStr?: string) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      if (fromD && d < fromD) return false;
      if (toD && d > toD) return false;
      return true;
    };

    const map = new Map<
      string,
      {
        ref_no: string;
        emp_id: string;
        dept: string;
        status: string;
        created_at: string;
        updated_at: string;
        actor: string;
        net_pay: number;
      }
    >();

    records.forEach((r) => {
      const inRange =
        isWithinRange(r.created_at) || isWithinRange(r.updated_at);
      if (!inRange) return;
      const key = r.ref_no || `rec-${r.emp_id}-${r.created_at || r.updated_at}`;
      const pay = Math.trunc(Number(r.net_pay));
      const safeAmount = Number.isFinite(pay) && pay > 0 ? pay : 0;
      map.set(key, {
        ref_no: r.ref_no || "",
        emp_id: r.emp_id || "",
        dept: r.dept_name || "Unknown",
        status: r.lp_status,
        created_at: r.created_at || "",
        updated_at: r.updated_at || "",
        actor: r.update_by || "System",
        net_pay: safeAmount,
      });
    });

    auditEvents.forEach((e) => {
      if (!isWithinRange(e.changedAt)) return;
      const key =
        e.ref_no && e.ref_no !== "—"
          ? e.ref_no
          : `audit-${e.emp_id}-${e.changedAt}`;
      const pay = Math.trunc(e.amount);
      const safeAmount = Number.isFinite(pay) && pay > 0 ? pay : 0;
      if (map.has(key)) {
        const existing = map.get(key)!;
        if (!existing.actor || existing.actor === "System")
          existing.actor = e.actor;
        if (!existing.updated_at) existing.updated_at = e.changedAt;
      } else {
        map.set(key, {
          ref_no: e.ref_no !== "—" ? e.ref_no : "",
          emp_id: e.emp_id,
          dept: e.dept,
          status: e.status,
          created_at: "",
          updated_at: e.changedAt,
          actor: e.actor,
          net_pay: safeAmount,
        });
      }
    });

    const rows = Array.from(map.values()).sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at).getTime();
      const dateB = new Date(b.created_at || b.updated_at).getTime();
      return dateB - dateA;
    });

    const suffix =
      exportFrom || exportTo
        ? `${exportFrom || "start"}_to_${exportTo || "end"}`
        : "all";

    downloadCSV(
      `quit-claims-export-${suffix}-${Date.now()}.csv`,
      rows.map((r) => [
        r.ref_no,
        r.emp_id,
        r.dept,
        r.status,
        r.created_at,
        r.updated_at,
        r.actor,
        String(r.net_pay),
      ]),
      [
        "Ref No",
        "Employee ID",
        "Department",
        "Status",
        "Created At",
        "Updated At",
        "Actor",
        "Net Pay",
      ],
    );

    setExportOpen(false);
  };

  // ── Loading / Error States ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <p className="text-sm font-medium mb-1">Failed to load dashboard</p>
        <p className="text-xs text-muted-foreground">
          {error?.message || "Please try again later"}
        </p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-3">
        <InboxIcon className="h-12 w-12 text-muted-foreground opacity-30" />
        <p className="text-base font-medium text-muted-foreground">
          No records found
        </p>
        <p className="text-sm text-muted-foreground">
          Quit claim records will appear here once available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 px-20 print:px-6 print:py-4">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 print:hidden flex-wrap">
          <Button
            variant="outline"
            onClick={() => setExportOpen(true)}
            size="sm"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* ── Global Date Range Filter ────────────────────────────────────────── */}
      <div className="rounded-xl border bg-card px-5 py-3.5 shadow-sm print:hidden">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <DateRangeFilter
            from={filterFrom}
            to={filterTo}
            onFromChange={setFilterFrom}
            onToChange={setFilterTo}
            onClear={() => {
              setFilterFrom("");
              setFilterTo("");
            }}
            isActive={isFilterActive}
          />
          {isFilterActive && (
            <p className="text-xs text-muted-foreground">
              Showing {filteredRecords.length} of {records.length} records
              {filterFrom && ` from ${filterFrom}`}
              {filterTo && ` to ${filterTo}`} · Recent Claims always shows
              latest activity
            </p>
          )}
        </div>
      </div>

      {/* ── Metrics Row 1 ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Pending Claims"
          value={metrics.pendingClaims}
          icon={Clock}
          description="Awaiting processing"
          accent="bg-yellow-400"
        />
        <StatCard
          title="Finalized Claims"
          value={metrics.finalizedClaims}
          icon={CheckCircle}
          description="Completed and finalized"
          accent="bg-purple-400"
        />
        <StatCard
          title="Approved Claims"
          value={metrics.approvedClaims}
          icon={CheckCircle}
          description="Approved, pending release"
          accent="bg-blue-400"
        />
        <StatCard
          title="Disapproved Claims"
          value={metrics.disapprovedClaims}
          icon={XCircle}
          description="Rejected claims"
          accent="bg-red-400"
        />
      </div>

      {/* ── Metrics Row 2 ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Released Claims"
          value={metrics.releasedClaims}
          icon={CheckCircle}
          description="Successfully released"
          accent="bg-green-400"
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(metrics.totalPendingAmount)}
          icon={TrendingUp}
          description="Pending, approved & finalized"
          accent="bg-orange-400"
        />
        <StatCard
          title="Released Amount"
          value={formatCurrency(metrics.totalReleasedAmount)}
          icon={BarChart2}
          description="From released claims only"
          accent="bg-emerald-400"
        />
      </div>

      {/* ── Charts ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quit Claims Trend */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">Quit Claims Trend</h3>
          {exitTrends.every((d) => d.exits === 0) ? (
            <EmptyState
              icon={TrendingUp}
              message="No data for the selected period"
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={exitTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  angle={exitTrends.length > 14 ? -35 : 0}
                  textAnchor={exitTrends.length > 14 ? "end" : "middle"}
                  height={exitTrends.length > 14 ? 56 : 30}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value, "Claims"]}
                />
                <Line
                  type="monotone"
                  dataKey="exits"
                  stroke="#8884d8"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#8884d8" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top 5 Departments */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <h3 className="text-base font-semibold mb-4">
            Top 5 Departments — Quit Claims
          </h3>
          {departmentClaims.length === 0 ? (
            <EmptyState
              icon={BarChart2}
              message="No department data for the selected period"
            />
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={departmentClaims}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [value, "Claims"]}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Claims (unaffected by global filter) ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Recent Quit Claims</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
              All time
            </span>
          </div>
          {recentClaims.length === 0 ? (
            <EmptyState
              icon={InboxIcon}
              message="No recent claims to display"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="text-left pb-3 pr-4 font-medium">Ref No.</th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Employee
                    </th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Department
                    </th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Updated By
                    </th>
                    <th className="text-left pb-3 pr-4 font-medium">
                      Updated At
                    </th>
                    <th className="text-left pb-3 pr-4 font-medium">Status</th>
                    <th className="text-right pb-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentClaims.map((claim, index) => (
                    <tr
                      key={index}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                        {claim.ref_no || "—"}
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {claim.emp_id}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {claim.department}
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                        {claim.lastActionAt
                          ? formatDateLong(claim.lastActionAt)
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-xs font-medium">
                        {claim.lastActionBy}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={claim.status} />
                      </td>
                      <td className="py-3 text-right font-semibold tabular-nums">
                        {formatCurrency(claim.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Export CSV Modal ────────────────────────────────────────────────── */}
      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 print:hidden">
          <div className="bg-card rounded-xl shadow-xl border p-6 w-full max-w-md mx-4 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Export Records — CSV</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Exports all claims and audit data merged into one file,
                duplicates removed. Leave date fields blank to export
                everything.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  From Date
                </label>
                <input
                  type="date"
                  value={exportFrom}
                  onChange={(e) => setExportFrom(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  To Date
                </label>
                <input
                  type="date"
                  value={exportTo}
                  onChange={(e) => setExportTo(e.target.value)}
                  className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setExportOpen(false);
                  setExportFrom("");
                  setExportTo("");
                }}
              >
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleExportCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
