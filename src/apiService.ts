"use server";

import { Report, SearchDataType, ChildDataItem, SupportData, UserProfileDetailsType, initDataType, AuthDataType, SecretViews, Secret, SharedWithMeResponse, StoragePublicKeyData, ContractSupportResponse, PublicKeysResponse, ProfileDetails, UserDetails, FrontendLogPayload } from "./types/types";
import { handleApiCall, createAppError, config } from "@/utils";
import { DataPayload } from "@/interfaces/addData";
import { getRefreshToken, setTokens, getAccessToken , clearTokens, isTokenExpiring } from "@/utils/cookieManager";

const API_BASE_URL = config.API_BASE_URL;

// Refresh token function
export async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken){
      console.warn("⚠️ No refresh token found in cookies."); 
      return null;
    }
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
       body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      console.error("❌ Refresh token request failed:", response.status);
      clearTokens();
      return null;
    }
    
    const data = await response.json();
    console.log("✅ Token refresh successful.");
    if (data.access_token && data.refresh_token) {
      setTokens(data.access_token, data.refresh_token);
       console.log("🔄 New tokens stored in cookies.");
      return data.access_token;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

// Helper function to get authentication headers with automatic token refresh
const getAuthHeaders = async (initData?: string | null): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  let token = getAccessToken();
  if (token) {
    if (isTokenExpiring(token)) {
      console.log("⚠️ Token expiring soon, attempting refresh...");
      const newToken = await refreshToken();
      if (newToken) {
        console.log("✅ Using newly refreshed access token");
        token = newToken; 
      } else {
        console.warn("❌ Failed to refresh, token might be invalid.");
      }
    }
    headers["Authorization"] = `Bearer ${token}`;
  } else if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }

  return headers;
};

export async function signupUser(initData: string): Promise<initDataType> {
  //const data = parseTelegramInitData(initData);
  const headers = await getAuthHeaders(initData);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers,
    //body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.access_token && result.refresh_token) {
    setTokens(result.access_token, result.refresh_token);
  }

  return result;
}

export async function getUserDetails(): Promise<initDataType> {
  const headers = await getAuthHeaders();
  
  const data = await handleApiCall<UserDetails>(async () => {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers,
    });
    return response;
  });

  return data.data;
}

export async function loginUserWeb(publicAddress:string, signature:string): Promise<AuthDataType> {
  const headers = await getAuthHeaders();
  
  const authData = await handleApiCall<AuthDataType>(async () => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify({publicAddress, signature}),
    });
    return response;
  });
  
  // Store the JWT token in cookie for future API calls
  if (authData.access_token && authData.refresh_token) {
    setTokens(authData.access_token, authData.refresh_token);
  }

  return authData;
}

export async function GetMyData(initData?: string): Promise<Secret[]> {
  const headers = await getAuthHeaders(initData);
  
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
  const headers = await getAuthHeaders(initData);
  
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
  const headers = await getAuthHeaders();
  
  const response = await handleApiCall<ProfileDetails>(async () => {
    const response = await fetch(
      `${API_BASE_URL}/users/telegram/profile?username=${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers,
      }
    );
    return response;
  }, undefined, 'json');

  // Check if the response contains this class, the user does not exist
  const tgDownloadLink = response?.profile?.includes("tl_main_download_link tl_main_download_link_ios");
  // Also Check if the response contains this class, the user does not exist
  const tgIconUser = response?.profile?.includes("tgme_icon_user");
  if (tgDownloadLink || tgIconUser) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(response?.profile ?? "", "text/html");
  const imgEl = doc.querySelector(".tgme_page_photo_image") as HTMLImageElement | null;
  const nameEl = doc.querySelector(".tgme_page_title span") as HTMLElement | null;
  const img = imgEl ? { src: imgEl.src } : null;
  const name = nameEl?.textContent?.trim() ?? "";
  const finalUsername = username.startsWith("@") ? username.substring(1) : username;
  const res: UserProfileDetailsType = {img: img, name: name, username: finalUsername, publicAddress: response.publicAddress, existsInPlatform: response.existsInPlatform};
  return res;
}

export async function getDataSharedWithMy(initData?: string): Promise<SharedWithMeResponse> {
  const headers = await getAuthHeaders(initData);
  
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
  const headers = await getAuthHeaders(initData);
  
  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/username/${encodeURIComponent(username)}`, {
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
    const headers = await getAuthHeaders(initData);
  
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
  const headers = await getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
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

export async function deletePassword(initData: string, id: string): Promise<void> {
  const headers = await getAuthHeaders(initData);

  // If no authentication method is available, throw an error
  if (!headers["Authorization"] &&!headers["X-Telegram-Init-Data"]) {
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

export async function getAutoCompleteUsername(initData: string, username: string): Promise<SearchDataType[]> {
  const headers = await getAuthHeaders(initData);
  
  const result = await handleApiCall<{ data: SearchDataType[] }>(async () => {
    const response = await fetch(`${API_BASE_URL}/users/search/autocomplete?query=${encodeURIComponent(username)}&limit=5&searchType=contains`, {
      method: "GET",
      headers,
    });
    return response;
  });
  
  return result.data;
}

export async function reportUser(initData: string, report: Report): Promise<void> {
  const headers = await getAuthHeaders(initData);
  
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
  const headers = await getAuthHeaders(initData);
  
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

export async function setPrivacyMode(initData: string, value: boolean): Promise<void> {
  const headers = await getAuthHeaders(initData);
  
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

export async function getPublicAddresses(initData: string | null): Promise<PublicKeysResponse> {
  const headers = await getAuthHeaders(initData);
  
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

export async function storeFrontendLog(payload: FrontendLogPayload): Promise<void> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/frontend-logs`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response;
  }, 'Failed to send frontend log');
}


