import { useEffect, useState } from "react";
import { getSecretsForAdmin } from "@/services";
import { SecretRow } from "@/types";

export default function useSecrets(page: number = 1, limit: number = 10) {
  const [secrets, setSecrets] = useState<SecretRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    flagged: 0,
  });

  useEffect(() => {
    async function fetchSecrets() {
      try {
        setLoading(true);

        const response = await getSecretsForAdmin(page, limit);

        if (response && Array.isArray(response.data)) {
          const formatted: SecretRow[] = response.data.map((item, idx) => ({
            id: (page - 1) * limit + idx + 1,
            title: item.title || "",
            ownerName: item.ownerName || "",
            ownerHandle: item.ownerHandle || "",
            contactEmail: item.contactEmail || "",
            createdDate: item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "",
            lastViewed: item.lastViewed
              ? new Date(item.lastViewed).toLocaleString()
              : "",
            statistics: {
              views: item.statistics?.views ?? 0,
              shares: item.statistics?.shares ?? 0,
              reports: item.statistics?.reports ?? 0,
            },
          }));

          setSecrets(formatted);

          const computedTotalPages =
            response.totalPages ??
            Math.max(
              1,
              Math.ceil((response.total ?? formatted.length) / (response.limit ?? limit))
            );
          setTotalPages(computedTotalPages);

          const flaggedOnPage = formatted.filter(s => s.statistics.reports > 0).length;

          setStats({
            total: response.total ?? formatted.length,
            active: 0,
            inactive: 0,
            flagged: flaggedOnPage,
          });
        } else {
          setError("Invalid response format from server");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load secrets");
      } finally {
        setLoading(false);
      }
    }

    fetchSecrets();
  }, [page, limit]);

  return { secrets, stats, totalPages, loading, error };
}