import type { 
  Secret, 
  SharedWithMeResponse, 
  ChildDataItem, 
  SecretViews, 
  StoragePublicKeyData,
  PublicKeysResponse 
} from "@/types/types";
import type { DataPayload } from "@/interfaces/addData";
import { handleApiCall, createAppError, config } from "@/utils";
import { getAuthHeaders } from "@/services/auth/authService";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Get user's own secrets/passwords
 */
export async function GetMyData(initData?: string): Promise<Secret[]> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError(new Error("Authentication required"), 'auth');
  }
  
  return handleApiCall<Secret[]>(
    () => fetch(`${API_BASE_URL}/passwords`, {
      method: "GET",
      headers,
    }),
    "Failed to fetch your data"
  );
}

/**
 * Store encrypted data to backend
 */
export async function storageEncryptedData(
  data: DataPayload,
  initData?: string
): Promise<unknown> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError(new Error("Authentication required"), 'auth');
  }
  
  return handleApiCall<unknown>(
    () => fetch(`${API_BASE_URL}/passwords`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    }),
    "Failed to save encrypted data"
  );
}

/**
 * Get secrets shared with current user
 */
export async function getDataSharedWithMy(initData?: string): Promise<SharedWithMeResponse> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/shared-with-me`, {
      method: "GET",
      headers,
    });
    return response;
  });
}

/**
 * Hide a password (soft delete)
 */
export async function hidePassword(initData: string, id: string): Promise<void> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/hide/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: headers,
    });
    return response;
  });
}

/**
 * Delete a password permanently
 */
export async function deletePassword(initData: string, id: string): Promise<void> {
  const headers = await getAuthHeaders(initData);

  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/owner/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers,
    });
    return response;
  });
}

/**
 * Get children secrets for a parent secret
 */
export async function getChildrenForSecret(
  initData: string, 
  parentId: string
): Promise<ChildDataItem[] | { statusCode: number; message: string }> {
  const headers = await getAuthHeaders(initData);
  
  const result = await handleApiCall<{ passwords?: ChildDataItem[] } | { statusCode: number; message: string }>(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/children/${encodeURIComponent(parentId)}?page=1&secret_count=200`, {
      method: "GET",
      headers,
    });
    return response;
  });

  if ('passwords' in result) {
    return result.passwords ?? [];
  }
  return result as { statusCode: number; message: string };
}

/**
 * Mark a secret as viewed
 */
export async function setSecretView(initData: string, id: string): Promise<void> {
  const headers = await getAuthHeaders(initData);
  
  await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/secret-view/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers,
    });
    return response;
  });
}

/**
 * Get view statistics for a secret
 */
export async function getSecretViews(initData: string, id: string): Promise<SecretViews> {
  const headers = await getAuthHeaders(initData);
  
  const result = await handleApiCall<SecretViews>(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/secret-view-stats/${encodeURIComponent(id)}`, {
      method: "GET",
      headers,
    });
    return response;
  });

  return result;
}

/**
 * Store public key and optional password
 */
export async function storagePublicKeyAndPassword(
  data: StoragePublicKeyData,
  initData: string,
): Promise<void> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/public-addresses`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return response;
  });
}

/**
 * Get public addresses for user
 */
export async function getPublicAddresses(initData: string | null): Promise<PublicKeysResponse> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/public-addresses`, {
      method: "GET",
      headers: headers,
    });
    return response;
  });
}

/**
 * Set privacy mode for user
 */
export async function setPrivacyMode(initData: string, value: boolean): Promise<void> {
  const headers = await getAuthHeaders(initData);
  
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/me/privacy-mode`, {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify({ privacyMode: value})
    });
    return response;
  });
}
