import { TelegramUser } from "../types/types";

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

  export const debounce = function (
    functionToDebounce: (...args: any[]) => any,
    delay: number
  ) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => functionToDebounce(...args), delay);
    };
  };

  export const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid date';
    }
  };