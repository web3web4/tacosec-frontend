import { useState, useEffect } from "react";
import { getLoggerForAdmin } from "@/services";
import { LoggerRow, AdminLoggerResponse } from "@/types";

export default function useLogger(page: number = 1, limit: number = 10) {
  const [logs, setLogs] = useState<LoggerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState({
    totalCount: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const response: AdminLoggerResponse = await getLoggerForAdmin(page, limit);

        const list = Array.isArray(response.data) ? response.data : [];

        if (!Array.isArray(list)) {
          setError("Invalid response format from server");
          return;
        }

        const formatted: LoggerRow[] = list.map((log) => ({
          id: log._id,
          userId: log.userId || "N/A",
          telegramId: log.telegramId || "N/A",
          username: log.username || "N/A",
          logData: log.logData,
          createdAt: log.createdAt ? new Date(log.createdAt).toLocaleString() : "N/A",
        }));

        setLogs(formatted);

        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setStats({
            totalCount: response.pagination.totalCount || 0,
            currentPage: response.pagination.currentPage || 1,
            hasNextPage: response.pagination.hasNextPage || false,
            hasPrevPage: response.pagination.hasPrevPage || false,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load logger data");
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [page, limit]);

  return { logs, stats, totalPages, loading, error };
}

