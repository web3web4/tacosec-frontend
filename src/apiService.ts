"use server";

import { Report, SearchDataType, ChildDataItem, SupportData, UserProfileDetailsType, initDataType, AuthDataType, SecretViews, Secret, SharedWithMeResponse, StoragePublicKeyData, ContractSupportResponse, PublicKeysResponse } from "./types/types";
import { parseTelegramInitData, handleApiCall, createAppError } from "@/utils";
import { DataPayload } from "@/interfaces/addData";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to get authentication headers
const getAuthHeaders = (initData?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  
  // Try to get JWT token from localStorage first
  const token = localStorage.getItem('jwt_token');
  
  if (token) {
    // Use JWT token if available
    headers["Authorization"] = `Bearer ${token}`;
  } else if (initData) {
    // Fall back to Telegram initData if available
    headers["X-Telegram-Init-Data"] = initData;
  }
  
  return headers;
};

export async function signupUser(initData: string): Promise<initDataType> {
  const data = parseTelegramInitData(initData);
  const headers = getAuthHeaders(initData);
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/signup`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return response;
  });
}

export async function loginUserWeb(publicAddress:string, signature:string): Promise<AuthDataType> {
  const headers = getAuthHeaders();
  
  const authData = await handleApiCall<AuthDataType>(async () => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify({publicAddress, signature}),
    });
    return response;
  });
  
  // Store the JWT token in localStorage for future API calls
  if (authData.access_token) {
    localStorage.setItem('jwt_token', authData.access_token);
  }

  return authData;
}

export async function GetMyData(initData?: string): Promise<Secret[]> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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
 * send data encrypted to backend for storage
 */
export async function storageEncryptedData(
  data: DataPayload,
  initData?: string
): Promise<unknown> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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

export async function getUserProfileDetails(username: string): Promise<UserProfileDetailsType | null> {
  if (!username) return null;
  const headers = getAuthHeaders();
  
  const html = await handleApiCall<string>(async () => {
    const response = await fetch(
      `${API_BASE_URL}/users/telegram/profile?username=${username}`,
      {
        method: "GET",
        headers,
      }
    );
    return response;
  }, undefined, 'text');

  // Check if the response contains this class, the user does not exist
  const tgDownloadLink = html.includes("tl_main_download_link tl_main_download_link_ios");
  // Also Check if the response contains this class, the user does not exist
  const tgIconUser = html.includes("tgme_icon_user");
  if (tgDownloadLink || tgIconUser) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgEl = doc.querySelector(".tgme_page_photo_image") as HTMLImageElement | null;
  const nameEl = doc.querySelector(".tgme_page_title span") as HTMLElement | null;
  const img = imgEl ? { src: imgEl.src } : null;
  const name = nameEl?.textContent?.trim() ?? "";
  const finalUsername = username.startsWith("@") ? username.substring(1) : username;
  const res: UserProfileDetailsType = {img: img, name: name, username: finalUsername, address: ""};
  return res;
}

export async function getDataSharedWithMy(initData?: string): Promise<SharedWithMeResponse> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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

export async function checkIfUserAvailable(initData: string, username: string): Promise<boolean> {
  const headers = getAuthHeaders(initData);
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
      method: "GET",
      headers,
    });
    return response;
  });
}


export async function storagePublicKeyAndPassword(
  data: StoragePublicKeyData,
  initData: string
): Promise<void> {
    const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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

export async function hidePassword(initData: string, id: string): Promise<void> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/hide/${id}`, {
      method: "PATCH",
      headers: headers,
    });
    return response;
  });
}

export async function deletePassword(initData: string, id: string): Promise<void> {
  const headers = getAuthHeaders(initData);

  // If no authentication method is available, throw an error
  if (!headers["Authorization"] &&!headers["X-Telegram-Init-Data"]) {
    throw createAppError("Authentication required", 'auth');
  }
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/owner/${id}`, {
      method: "DELETE",
      headers: headers,
    });
    return response;
  });
}

export async function getAutoCompleteUsername(initData: string, username: string): Promise<SearchDataType[]> {
  const headers = getAuthHeaders(initData);
  
  const result = await handleApiCall<{ data: SearchDataType[] }>(async () => {
    const response = await fetch(`${API_BASE_URL}/users/search/autocomplete?query=${username}&limit=5&searchType=contains`, {
      method: "GET",
      headers,
    });
    return response;
  });
  
  return result.data;
}

export async function reportUser(initData: string, report: Report): Promise<void> {
  const headers = getAuthHeaders(initData);
  
  await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers,
      body: JSON.stringify(report),
    });
    return response;
  });
}

export async function sendContractSupport(initData: string, supportData: SupportData): Promise<ContractSupportResponse> {
  const headers = getAuthHeaders(initData);
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/telegram/send-to-specific-admin`, {
      method: "POST",
      headers,
      body: JSON.stringify(supportData),
    });
    return response;
  });
}

export async function getChildrenForSecret(initData: string, parentId: string): Promise<ChildDataItem[]  | { statusCode: number; message: string }> {
  const headers = getAuthHeaders(initData);
  
  const result = await handleApiCall<{ passwords?: ChildDataItem[] } | { statusCode: number; message: string }>(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/children/${parentId}?page=1&secret_count=200`, {
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

export async function setSecretView(initData: string, id: string): Promise<void> {
  const headers = getAuthHeaders(initData);
  
  await handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/secret-view/${id}`, {
      method: "PATCH",
      headers,
    });
    return response;
  });
}

export async function getSecretViews(initData: string, id: string): Promise<SecretViews> {
  const headers = getAuthHeaders(initData);
  
  const result = await handleApiCall<SecretViews>(async () => {
    const response = await fetch(`${API_BASE_URL}/passwords/secret-view-stats/${id}`, {
      method: "GET",
      headers,
    });
    return response;
  });

  return result;
}

export async function setPrivacyMode(initData: string, value: boolean): Promise<void> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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

export async function getPublicAddresses(initData: string): Promise<PublicKeysResponse> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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

