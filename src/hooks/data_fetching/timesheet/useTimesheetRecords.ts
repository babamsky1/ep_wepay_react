import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { TimesheetRecord } from "@/types/lastPayTypes";

const QUERY_CONFIG = { 
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000   // 10 minutes
} as const;

// Timesheet records hook
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

      return records;
    },
    ...QUERY_CONFIG,
    refetchOnWindowFocus: false,
  });
};
