import type { 
  AdminUsersResponse,
  AdminReportsResponse,
  AdminSecretsResponse,
  AdminResponseActive,
  AdminNotificationsResponse,
  AdminLoggerResponse 
} from "@/types/types";
import { handleApiCall, createAppError, config } from "@/utils";
import { getAuthHeaders } from "@/services/auth/authService";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Get all users (admin only)
 */
export async function getUsersForAdmin(page: number = 1, limit: number = 20): Promise<AdminUsersResponse> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/admin/all?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response;
  }, 'Failed to get users for admin');
}

/**
 * Get all reports (admin only)
 */
export async function getReportsForAdmin(page: number = 1, limit: number = 20): Promise<AdminReportsResponse> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/reports/admin/reported-users?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response;
  }, 'Failed to get reports for admin');
}

/**
 * Get all secrets (admin only)
 */
export async function getSecretsForAdmin(page: number = 1, limit: number = 20): Promise<AdminSecretsResponse> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/admin/all?isActive=true&page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response;
  }, 'Failed to get secrets for admin');
}

/**
 * Change user active status (admin only)
 */
export async function changeIsActiveUser(userId: string, isActive: boolean): Promise<AdminResponseActive> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/admin/active-status/${userId}`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: isActive }),
    });

    if (!response.ok) {
      throw createAppError('Failed to change user active status', 'server');
    }

    return response;
  }, 'Failed to change user active status');
}

/**
 * Get all notifications (admin only)
 */
export async function getNotificationsForAdmin(page: number = 1, limit: number = 10): Promise<AdminNotificationsResponse> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/notifications?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response;
  }, 'Failed to get notifications for admin');
}

/**
 * Get logger data (admin only)
 */
export async function getLoggerForAdmin(page: number = 1, limit: number = 10): Promise<AdminLoggerResponse> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/logger?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });
    return response;
  }, 'Failed to get logger data for admin');
}
