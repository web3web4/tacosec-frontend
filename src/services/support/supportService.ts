import type { 
  SupportData,
  ContractSupportResponse,
  FrontendLogPayload,
} from "@/types/types";
import { handleApiCall, createAppError, config } from "@/utils";
import { getAuthHeaders } from "@/services/auth/authService";

const API_BASE_URL = config.API_BASE_URL;

/**
 * Send support message to admin
 */
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

/**
 * Store frontend log
 */
export async function storeFrontendLog(payload: FrontendLogPayload): Promise<void> {
  const headers = await getAuthHeaders();

  if (!headers['Authorization'] && !headers['X-Telegram-Init-Data']) {
    throw createAppError('Authentication required', 'auth');
  }

  return handleApiCall(async () => {
    const response = await fetch(`${API_BASE_URL}/logger`, {
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


