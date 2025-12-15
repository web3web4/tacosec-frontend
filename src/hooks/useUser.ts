import { useState, useEffect } from "react";
import { changeIsActiveUser, getUsersForAdmin } from "@/services";
import { UserData } from "@/types";

export default function useUsers(page: number = 1, limit: number = 20) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    bannedUsers: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);

        const response = await getUsersForAdmin(page, limit);

        if (response && Array.isArray(response.data)) {
          setUsers(response.data);

          setStats({
            totalUsers:
              response.totalUsers || response.total || response.data.length,
            activeUsers: response.activeUsers || 0,
            inactiveUsers: response.inactiveUsers || 0,
            bannedUsers: response.sharingRestrictedUsers || 0,
          });
          setTotalPages(response.totalPages || 1);
        } else {
          console.error("Unexpected response format:", response);
          setError("Invalid response format from server");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load users");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [page, limit]);

    async function toggleActiveStatus(userId: string, isActive: boolean) {
    try {
      const res = await changeIsActiveUser(userId, isActive);
      return res;
    } catch (error) {
      console.error('Failed to change active status:', error);
    }
  }

  return { users, stats, totalPages, loading, error, toggleActiveStatus };
}
