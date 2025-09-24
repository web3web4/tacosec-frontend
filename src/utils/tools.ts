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