import { TelegramUser } from "@/types/types";

export function parseTelegramInitData(initData: string){
    const params = new URLSearchParams(initData);
    const userJson = params.get("user");
    let user: TelegramUser = {} as TelegramUser;
  
    try {
      if (userJson) {
        user = JSON.parse(decodeURIComponent(userJson));
      }
    } catch (e) {
      console.error("Field To Get User Data:", e);
    }
  
    return {
      telegramId: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      authDate: params.get("auth_date"),
      hash: params.get("hash")
    };
  }

/**
 * Cross-platform clipboard copy function that works in both browser and Telegram Mini Apps
 * Falls back to manual copy if both methods fail
 * 
 * @param text - The text to copy to clipboard
 * @param onSuccess - Callback function to execute on successful copy
 * @param onManualCopy - Callback function to show manual copy UI when automatic copy fails
 * @returns Promise<boolean> - Whether the copy was successful
 */
export async function copyToClipboard(
  text: string, 
  onSuccess?: () => void, 
  onManualCopy?: () => void
): Promise<boolean> {
  // Check if we're in Telegram Mini App
  const isTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp;
  
  try {
    // For Telegram Mini Apps, use manual copy as the primary method
    // since direct clipboard access is restricted
    if (isTelegram) {
      // Immediately trigger manual copy for Telegram Mini Apps
      if (onManualCopy) {
        onManualCopy();
        return true;
      }
    }
    
    // For non-Telegram environments, use standard clipboard API
    await navigator.clipboard.writeText(text);
    if (onSuccess) onSuccess();
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    
    // If clipboard API fails, trigger manual copy UI
    if (onManualCopy) onManualCopy();
    return false;
  }
}

  export const debounce = <TArgs extends unknown[]>(
    functionToDebounce: (...args: TArgs) => void,
    delay: number
  ) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: TArgs): void => {
      clearTimeout(timeout);
      timeout = setTimeout(() => functionToDebounce(...args), delay);
    };
  };

  export const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
  
      return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  };
  
export const formatAddress = (formatNumber: number, addr: string | undefined) => {
    if (!addr) return "";
    if (addr.length <= 8) return addr;
    return `${addr.substring(0, formatNumber)}......${addr.substring(addr.length - formatNumber)}`;
  };

// Escapes HTML special characters to prevent injection in innerHTML contexts
export function escapeHtml(input: string): string {
  if (!input) return "";
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Sanitize to plain text: remove HTML tags, control characters, normalize;
// Optionally preserve newlines when desired
export function sanitizePlainText(input: string, opts?: { maxLength?: number; preserveNewlines?: boolean }): string {
  if (!input) return "";
  let s = input;
  const preserve = !!opts?.preserveNewlines;
  // Remove control characters: exclude \n, \r, \t when preserving newlines
  s = preserve
    ? s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    : s.replace(/[\u0000-\u001F\u007F]/g, "");
  // Strip HTML tags
  s = s.replace(/<[^>]*>/g, "");
  // Normalize unicode to reduce confusables
  try { s = s.normalize('NFKC'); } catch {}
  // Collapse whitespace
  if (preserve) {
    // Collapse spaces/tabs, keep line breaks
    s = s.replace(/[ \t]+/g, ' ');
    // Trim each line and remove trailing blank lines
    s = s
      .split(/\r?\n/)
      .map(line => line.trim())
      .join('\n')
      .trim();
  } else {
    // Collapse all whitespace to single spaces
    s = s.replace(/\s+/g, ' ').trim();
  }
  if (opts?.maxLength && s.length > opts.maxLength) {
    s = s.substring(0, opts.maxLength);
  }
  return s;
}

// Title-specific sanitization: plain text, restricted length
export function sanitizeTitle(input: string): string {
  return sanitizePlainText(input, { maxLength: 128 });
}

// Username input sanitization: keeps optional leading '@', allows [A-Za-z0-9_], max length 32
export function sanitizeUsernameInput(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  const hasAt = trimmed.startsWith('@');
  const raw = hasAt ? trimmed.slice(1) : trimmed;
  const cleaned = raw.replace(/[^A-Za-z0-9_]/g, '').slice(0, 32);
  return hasAt ? `@${cleaned}` : cleaned;
}