import { useState, useEffect } from "react";
import { getReportsForAdmin } from "@/apiService";
import { ReportRow, AdminReportsResponse } from "@/types";

export default function useReports(page: number = 1, limit: number = 10) {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    highPriority: 0,
    resolved: 0,
  });

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const response: AdminReportsResponse = await getReportsForAdmin(page, limit);

        // Accept server shape with "reports"
        const list = Array.isArray(response.reports) ? response.reports : [];

        if (!Array.isArray(list)) {
          setError("Invalid response format from server");
          return;
        }

        const formatted: ReportRow[] = list.map((r, idx) => ({
          id: idx + 1, // convert string id to stable numeric index for UI
          reportType: r.reportType || "N/A",
          reportDetails: r.reportDetails || "N/A",
          reportedContent: r.reportedContent || "N/A",
          contentOwner:
            r.reportedUserInfo?.username ||
            r.contentOwner ||
            r.reportedUserInfo?.latestPublicAddress ||
            "Unknown",
          secretId: r.secretId || "-",
          reporter:
            r.reporterInfo?.username ||
            r.reporterHandle ||
            r.reporterInfo?.latestPublicAddress ||
            "Unknown",
          reporterHandle: r.reporterInfo?.latestPublicAddress || r.reporterHandle || "",
          status: r.status || (r.resolved ? "resolved" : "pending"),
          priority: r.priority || "low",
          createdDate: r.createdDate ? new Date(r.createdDate).toLocaleString() : "",
          updatedDate: r.updatedDate ? new Date(r.updatedDate).toLocaleString() : "",
        }));

        setReports(formatted);

        const total = response.total ?? formatted.length;
        const computedTotalPages = response.totalPages ?? Math.ceil(total / (response.limit ?? limit));
        setTotalPages(computedTotalPages);

        const pending = response["PENDING"] ?? formatted.length;
        const highPriority = response["HIGH PRIORITY"] ?? formatted.length;
        const resolved = response["RESOLVED"] ?? formatted.length;
        setStats({ total, pending, highPriority, resolved });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [page, limit]);

  return { reports, stats, totalPages, loading, error };
}
