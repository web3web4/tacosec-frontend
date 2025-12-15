import { useState, useEffect } from "react";
import { getNotificationsForAdmin } from "@/services";
import { NotificationRow, AdminNotificationsResponse } from "@/types";

export default function useNotifications(page: number = 1, limit: number = 10) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [stats, setStats] = useState({
    totalItems: 0,
    currentPage: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setLoading(true);
        const response: AdminNotificationsResponse = await getNotificationsForAdmin(page, limit);

        const list = Array.isArray(response.notifications) ? response.notifications : [];

        if (!Array.isArray(list)) {
          setError("Invalid response format from server");
          return;
        }

        const formatted: NotificationRow[] = list.map((n) => ({
          id: n._id,
          subject: n.subject || "N/A",
          message: n.message || "N/A",
          type: n.type || "N/A",
          recipientUserId: n.recipientUserId || "N/A",
          senderUserId: n.senderUserId || "N/A",
          metadata: n.metadata,
          sentAt: n.sentAt ? new Date(n.sentAt).toLocaleString() : "N/A",
        }));

        setNotifications(formatted);

        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setStats({
            totalItems: response.pagination.totalItems || 0,
            currentPage: response.pagination.currentPage || 1,
            hasNextPage: response.pagination.hasNextPage || false,
            hasPrevPage: response.pagination.hasPrevPage || false,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [page, limit]);

  return { notifications, stats, totalPages, loading, error };
}

