import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TimesheetRecord } from "@/types/lastPayTypes";

const QUERY_CONFIG = { 
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000   // 10 minutes
} as const;

/**
 * Hook for fetching all timesheet records
 * Used by TimesheetUploading component
 * Returns records sorted by upload date in descending order (newest first)
 */
export const useTimesheetRecords = (page = 1, page_size = 25) => {
  return useQuery<TimesheetRecord[]>({
    queryKey: ["timesheetRecords", page, page_size],
    queryFn: async (): Promise<TimesheetRecord[]> => {
      const result = await api.timesheetRecords.list({ page, page_size });

      // Handle backend response format {success: true, data: [...]}
      let records: TimesheetRecord[] = [];

      if (result && typeof result === 'object' && 'success' in result && result.success && 'data' in result && Array.isArray(result.data)) {
        records = result.data;
      } else if (Array.isArray(result.data)) {
        records = result.data;
      } else if (result.data && typeof result.data === 'object' && 'data' in result.data && Array.isArray((result.data as any).data)) {
        records = (result.data as any).data;
      } else if (Array.isArray(result)) {
        records = result;
      } else {
        return [];
      }

      // Sort by upload date in descending order (newest first)
      return records.sort((a: TimesheetRecord, b: TimesheetRecord) => {
        const aTime = new Date(a.uploaded_at ?? "1970-01-01").getTime();
        const bTime = new Date(b.uploaded_at ?? "1970-01-01").getTime();
        return bTime - aTime;
      });
    },
    ...QUERY_CONFIG,
    refetchOnWindowFocus: false,
  });
};
