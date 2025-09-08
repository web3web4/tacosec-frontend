import { AuthMethod } from "../types/types";

export function detectAuthMethod(): AuthMethod | null {
  if (typeof window === "undefined") return null;

  if (!!window.Telegram?.WebApp?.initData && window.Telegram.WebApp.initData.length > 0) {
    return "telegram";
  }

  return "web";
}
