export {};

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        showAlert(arg0: string): unknown;
        initData: string;
        expand: () => void;
        ready: () => void;
        initDataUnsafe?: {
          start_param: string;
          user?: {
            id?: number;
            username?: string;
            first_name?: string;
            last_name?: string;
          };
        };
        // Clipboard API methods
        showClipboardButton?: (shown: boolean) => boolean;
        onClipboardTextReceived?: (clipboardText: string) => void;
        readTextFromClipboard?: (callback: (clipboardText: string) => void) => boolean;
      };
    };
  }
}
