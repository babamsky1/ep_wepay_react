import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ErrorStateProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
}

export const ErrorState = ({ title = "Failed to load records", message, showBackButton = false }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg border p-6">
      <AlertCircle className="h-8 w-8 text-red-600 mb-4" />
      <p className="text-sm text-slate-600 mb-2">{title}</p>
      {message && <p className="text-xs text-slate-500 mb-4">{message}</p>}
      {showBackButton && (
        <button
          onClick={() => navigate("/lastpay")}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          ← Back to Last Pay Records
        </button>
      )}
    </div>
  );
};
