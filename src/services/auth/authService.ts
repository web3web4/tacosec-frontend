import type { initDataType, AuthDataType, UserDetails } from "@/types/types";
import { handleApiCall, config } from "@/utils";
import { getRefreshToken, setTokens, getAccessToken, clearTokens, isTokenExpiring } from "@/utils/cookieManager";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Refresh the access token using the refresh token
 */
export async function refreshToken(): Promise<string | null> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
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

/**
 * Helper function to get authentication headers with automatic token refresh
 */
export async function getAuthHeaders(initData?: string | null): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let token = getAccessToken();
  
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  } else if (token) {
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
  }
  
  return headers;
}

/**
 * Sign up/login user via Telegram
 */
export async function signupUser(initData: string): Promise<initDataType> {
  const headers = await getAuthHeaders(initData);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers,
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

/**
 * Get current user details
 */
export async function getUserDetails(): Promise<initDataType["user"]> {
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

/**
 * Login user via web (wallet signature)
 */
export async function loginUserWeb(publicAddress: string, signature: string): Promise<AuthDataType> {
  const headers = await getAuthHeaders();
  
  const authData = await handleApiCall<AuthDataType>(async () => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers,
      body: JSON.stringify({ publicAddress, signature }),
    });
    return response;
  });
  
  // Store the JWT token in cookies for future API calls
  if (authData.access_token && authData.refresh_token) {
    setTokens(authData.access_token, authData.refresh_token);
  }

  return authData;
}
