import type { 
  UserProfileDetailsType, 
  SearchDataType, 
  ProfileDetails,
  AddInformationUser,
  AddInformationUserResponse, 
  AlertsType,
  Report,
  PublicAddressChallangeResponse
} from "@/types/types";
import { handleApiCall, config } from "@/utils";
import { getAuthHeaders } from "@/services/auth/authService";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Get Telegram user profile details
 */
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
  const tgIconUser = response?.profile?.includes("tgme_icon_user");
  if (tgDownloadLink || tgIconUser) return null;
  
  const parser =new DOMParser();
  const doc = parser.parseFromString(response?.profile ?? "", "text/html");
  const imgEl = doc.querySelector(".tgme_page_photo_image") as HTMLImageElement | null;
  const nameEl = doc.querySelector(".tgme_page_title span") as HTMLElement | null;
  const img = imgEl ? { src: imgEl.src } : null;
  const name = nameEl?.textContent?.trim() ?? "";
  const finalUsername = username.startsWith("@") ? username.substring(1) : username;
  const res: UserProfileDetailsType = {
    img: img, 
    name: name, 
    username: finalUsername, 
    publicAddress: response.publicAddress, 
    existsInPlatform: response.existsInPlatform
  };
  return res;
}

/**
 * Check if user is available on the platform
 */
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

/**
 * Get autocomplete suggestions for username search
 */
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

/**
 * Add or update user information (phone, email, name)
 */
export async function addInformationUser(payload: AddInformationUser): Promise<AddInformationUserResponse> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw new Error('Authentication required');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/users/update-info`, {
      method: 'PATCH',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return response;
  }, 'Failed to add information user');
}

/**
 * Get user's alerts/notifications
 */
export async function getAlerts(initData: string | null, page: number): Promise<AlertsType> {
  const headers = await getAuthHeaders(initData);

  const result = await handleApiCall<AlertsType>(async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/my?page=${page}&limit=10&senderOrrecipient=recipient`, {
      method: "GET",
      headers,
    });
    return response;
  });

  return result;
}

/**
 * Report a user
 */
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


export async function publicAddressChallange(publicAddress: string , initData: string): Promise<PublicAddressChallangeResponse> {
  const headers = await getAuthHeaders(initData);

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw new Error('Authentication required');
  }
  
  return handleApiCall<PublicAddressChallangeResponse>(async () => {
    const response = await fetch(`${API_BASE_URL}/public-addresses/challange`, {
      method: "POST",
      headers,
      body: JSON.stringify({ publicAddress:publicAddress }),
    });
    return response;
  }, 'Failed to get public address challange');
}