import { clearTokens } from "./cookieManager";
import { MetroSwal } from "./metroSwal";
import { clearCache } from "./secretDb";

/**
 * Clears all wallet-related data from localStorage and cookies,
 * then reloads the page. Shows a confirmation dialog first.
 * 
 * @param isBrowser - Whether the current environment is a browser (for cookie clearing)
 */
export const handleClearAllData = (isBrowser: boolean) => {
  MetroSwal.fire({
    icon: "warning",
    title: "Delete all data?",
    html: "This will permanently remove your wallet and all related data from this device. This action cannot be undone.",
    confirmButtonText: "Delete",
    showCancelButton: true,
    cancelButtonText: "Keep data",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await clearCache();
      // Delete the specified localStorage items
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

      // For web users: clear auth cookies (access_token, refresh_token)
      if (isBrowser) {
        try {
          clearTokens();
        } catch (err) {
          console.error("Failed to clear auth tokens:", err);
        }
      }

      // Reload the page to reflect changes
      window.location.reload();
    }
  });
};
