const STATUS_COLORS: Record<string, string> = {
  RELEASED: "bg-green-600 text-white tracking-wide",
  PENDING: "bg-yellow-600 text-white tracking-wide",
  FINALIZED: "bg-purple-600 text-white tracking-wide",
  APPROVED: "bg-blue-600 text-white tracking-wide",
  DISAPPROVED: "bg-red-600 text-white tracking-wide",
};

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  superadmin: { label: "Super Admin", color: "bg-purple-100 text-purple-800" },
  finance: { label: "Finance", color: "bg-green-100 text-green-800" },
  hr: { label: "HR", color: "bg-blue-100 text-blue-800" },
  manager: { label: "Manager", color: "bg-orange-100 text-orange-800" },
};

interface StatusBadgeProps {
  value: string;
  type?: "status" | "role";
}

export const StatusBadge = ({ value, type = "status" }: StatusBadgeProps) => {
  if (type === "role") {
    const config = ROLE_CONFIG[value as keyof typeof ROLE_CONFIG] || {
      label: value,
      color: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[value.toUpperCase()] ?? "bg-gray-100 text-gray-800"}`}>
      {value.toUpperCase()}
    </span>
  );
};
