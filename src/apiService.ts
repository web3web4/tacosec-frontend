"use server";

import { Report, SearchDataType, ChildDataItem, SupportData, UserProfileDetailsType, initDataType, AuthDataType, SecretViews, Secret, SharedWithMeResponse, StoragePublicKeyData, ContractSupportResponse, PublicKeysResponse } from "./types/types";
import { parseTelegramInitData } from "@/utils";
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
  const response = await fetch(`${API_BASE_URL}/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function loginUserWeb(publicAddress:string, signature:string): Promise<AuthDataType> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({publicAddress, signature}),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const authData:AuthDataType = await response.json();
  
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
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${API_BASE_URL}/passwords`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized errors specifically
    if (response.status === 401) {
      // Clear the invalid token if it exists
      localStorage.removeItem('jwt_token');
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
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
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${API_BASE_URL}/passwords`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    // Handle 401 Unauthorized errors specifically
    if (response.status === 401) {
      // Clear the invalid token if it exists
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getUserProfileDetails(username: string): Promise<UserProfileDetailsType | null> {
  if (!username) return null;
  const response = await fetch(
    `${API_BASE_URL}/users/telegram/profile?username=${username}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const html = await response.text();
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
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${API_BASE_URL}/passwords/shared-with-me`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized errors specifically
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function checkIfUserAvailable(initData: string, username: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/users/username/${username}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}


export async function storagePublicKeyAndPassword(
  data: StoragePublicKeyData,
  initData: string
): Promise<void> {
    const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw new Error("Authentication required");
  }
  const response = await fetch(`${API_BASE_URL}/public-addresses`, {
    
    method: "POST",
    headers,

    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function hidePassword(initData: string, id: string): Promise<void> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw new Error("Authentication required");
  }
  const response = await fetch(`${API_BASE_URL}/passwords/hide/${id}`, {
    method: "PATCH",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function deletePassword(initData: string, id: string): Promise<void> {
  const headers = getAuthHeaders(initData);

  // If no authentication method is available, throw an error
  if (!headers["Authorization"] &&!headers["X-Telegram-Init-Data"]) {
    throw new Error("Authentication required");
  }
  const response = await fetch(`${API_BASE_URL}/passwords/owner/${id}`, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getAutoCompleteUsername(initData: string, username: string): Promise<SearchDataType[]> {
  const response = await fetch(`${API_BASE_URL}/users/search/autocomplete?query=${username}&limit=5&searchType=contains`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result.data;
}

export async function reportUser(initData: string, report: Report): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/reports`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Unknown error occurred');
  }
}

export async function sendContractSupport(initData: string, supportData: SupportData): Promise<ContractSupportResponse> {
  const response = await fetch(`${API_BASE_URL}/telegram/send-to-specific-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    body: JSON.stringify(supportData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Unknown error occurred');
  }

  return await response.json();
}

export async function getChildrenForSecret(initData: string, parentId: string): Promise<ChildDataItem[]  | { statusCode: number; message: string }> {
  const response = await fetch(`${API_BASE_URL}/passwords/children/${parentId}?page=1&secret_count=200`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
  });

  const result = await response.json();
  return result.passwords ?? result;;
}

export async function setSecretView(initData: string, id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/passwords/secret-view/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Unknown error occurred');
  }
}

export async function getSecretViews(initData: string, id: string): Promise<SecretViews> {
  const response = await fetch(`${API_BASE_URL}/passwords/secret-view-stats/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  return result
}

export async function setPrivacyMode(initData: string, value: boolean): Promise<void> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw new Error("Authentication required");
  }
  const response = await fetch(`${API_BASE_URL}/users/me/privacy-mode`, {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify({ privacyMode: value})
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

export async function getPublicAddresses(initData: string): Promise<PublicKeysResponse> {
  const headers = getAuthHeaders(initData);
  
  // If no authentication method is available, throw an error
  if (!headers["Authorization"] && !headers["X-Telegram-Init-Data"]) {
    throw new Error("Authentication required");
  }
  
  const response = await fetch(`${API_BASE_URL}/public-addresses`, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

