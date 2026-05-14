import { History, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface ActionLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string | null;
  icon: React.ReactNode;
  variant: "default" | "success" | "warning" | "error";
  details?: string;
}

interface ActionLogTableProps {
  isOpen: boolean;
  onClose: () => void;
  actionLogEntries: ActionLogEntry[];
  formatDateTime: (timestamp: string | null) => string;
  isLoading?: boolean;
  error?: string | null;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

const variantColor: Record<ActionLogEntry["variant"], string> = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error:   "text-red-600",
  default: "text-gray-600",
};

export function ActionLogTable({ 
  isOpen, 
  onClose, 
  actionLogEntries, 
  formatDateTime, 
  isLoading, 
  error, 
  totalCount = 0,
  currentPage = 1,
  pageSize = 25,
  onPageChange 
}: ActionLogTableProps) {
  if (!isOpen) return null;

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handlePrevPage = () => {
    if (hasPrevPage && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-white" />
            <h3 className="font-bold text-white text-lg uppercase tracking-wide drop-shadow-md">
              Action History
            </h3>
            {totalCount > 0 && (
              <span className="text-white/80 text-sm">
                {totalCount} total
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 max-h-[60vh]">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Loading action history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          ) : actionLogEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No action history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {actionLogEntries.map((entry) => (
                <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 mt-1 ${variantColor[entry.variant]}`}>
                      {entry.icon}
                    </div>
                    <div className="text-sm text-gray-900">
                      <span className="font-medium">{entry.user}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="text-gray-500">{formatDateTime(entry.timestamp)}</span>
                      <span className="text-gray-400 mx-1">·</span>
                      <span className="font-medium">{entry.action}</span>
                      {entry.details && (
                        <div className="mt-1 text-gray-600 whitespace-pre-wrap">{entry.details}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPrevPage}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    hasPrevPage 
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
                
                <div className="flex items-center space-x-1">
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    hasNextPage 
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
