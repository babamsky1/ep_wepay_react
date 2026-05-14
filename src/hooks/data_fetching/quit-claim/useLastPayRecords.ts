import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

const QUERY_CONFIG = { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 } as const;

export const useAllRecords = (page = 1, page_size = 25) => {
  const query = useQuery({
    queryKey: ["allRecords", page, page_size],
    queryFn: async () => {
      const records = (await api.lastPayRecords.list({ page, page_size })).data;
      return Array.isArray(records) ? records : [];
    },
    ...QUERY_CONFIG,
    refetchOnWindowFocus: false,
  });

  return query;
};

export const useSingleRecord = (ref_no: string) => {
  return useQuery({
    queryKey: ["record", ref_no],
    queryFn: async () => {
      const response = await api.lastPayRecords.getByRef(ref_no);
      return response.data;
    },
    enabled: !!ref_no,
    ...QUERY_CONFIG,
    refetchOnWindowFocus: false,
  });
};
