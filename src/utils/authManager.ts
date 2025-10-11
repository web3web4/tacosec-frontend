import { clearTokens, getAccessToken, isTokenExpiring } from './cookieManager';
import { refreshToken } from '@/apiService';

let refreshInterval: ReturnType<typeof setInterval> | null = null;
let lastAttempt = 0;

export function startTokenAutoRefresh(intervalMs = 60000) {
  if (refreshInterval) return;

  refreshInterval = setInterval(async () => {
    try {
      const token = getAccessToken();
      if (!token) return;

      const now = Date.now();
      if (now - lastAttempt < 45000) return;
      lastAttempt = now;

      if (isTokenExpiring(token)) {
        console.log("Auto-refreshing token...");
        await refreshToken();
      }
    } catch (error) {
      console.error("Auto-refresh failed:", error);
    }
  }, intervalMs);

  console.log("Token auto-refresh started.");
}

export function stopTokenAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log("Token auto-refresh stopped.");
  }
}

export function resetAppOnce() {
  const flagKey = "firstRunDone";

  const alreadyDone = localStorage.getItem(flagKey);
  if (alreadyDone) return; 
  const handleClearData = () => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("seedBackupDone-") ||
        key.startsWith("encryptedSeed-") ||
        key === "savePasswordInBackend" ||
        key === "publicAddress"
      ) {
        localStorage.removeItem(key);
      }
    });
  };

  handleClearData();
  clearTokens();

  localStorage.setItem(flagKey, "true");

  console.log("🔄 App data (selected keys + cookies) cleared on first launch only.");
}
