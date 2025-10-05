// authManager.ts
import { getToken, isTokenExpiring } from './cookieManager';
import { refreshToken } from '@/apiService';

let refreshInterval: ReturnType<typeof setInterval> | null = null;
let lastAttempt = 0;

export function startTokenAutoRefresh(intervalMs = 60000) {
  if (refreshInterval) return;

  refreshInterval = setInterval(async () => {
    try {
      const token = getToken();
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
