import React, { createContext, useContext, useState, useEffect } from "react";
import { initDataType } from "../types/types";
import { signupUser } from "../apiService";
import Swal from "sweetalert2";


interface UserContextType {
  userData: initDataType | null;
  initDataRaw: string | null;
  error: string | null;
  signUserData: (initData: initDataType) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [userData, setUserData] = useState<initDataType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);

  const hasWallet = typeof window !== "undefined" && localStorage.getItem(`encryptedSeed-${userData?.telegramId}`)!;

 const signUserData = async () => {
    setError(null);
    try {
      if (typeof window === "undefined" || !window.Telegram?.WebApp) {
        setError("Telegram WebApp is not supported");
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const initData = tg.initData;
      setInitDataRaw(initData);
      const response = await signupUser(initData);
      setUserData(response);
      if (hasWallet) {
        Swal.fire({
          icon: "success",
          title: "Welcome!",
          text: `Hello, ${response.firstName} ${" "}${response.lastName}! We're glad to have you here.`,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      Swal.fire({
        icon: "error",
        title: "Error In Sign User",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  useEffect(() => {
    signUserData();
  }, []);

  const value = {
    userData,
    initDataRaw,
    error,
    signUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
