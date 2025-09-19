import React, { createContext, useContext, useState, useEffect } from "react";
import { DirectLinkData, initDataType, TabType } from "@/types/types";
import { detectAuthMethod } from "@/hooks/useContextHelper";
import { signupUser } from "@/apiService";
import { MetroSwal, showError, createAppError } from "@/utils";


interface UserContextType {
  userData: initDataType | null;
  initDataRaw: string | null;
  directLinkData: DirectLinkData | null;
  error: string | null;
  isBrowser: boolean;
  signUserData: (initData: initDataType) => Promise<void>;
  setUserData: React.Dispatch<React.SetStateAction<initDataType | null>>
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {

  const [userData, setUserData] = useState<initDataType | null>(null);
  const [directLinkData, setDirectLinkData] = useState<DirectLinkData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initDataRaw, setInitDataRaw] = useState<string | null>(null);
  const [isBrowser, setIsBrowser] = useState(false);
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
        MetroSwal.success(
          "Welcome!",
          `Hello, ${response.firstName} ${" "}${response.lastName}! We're glad to have you here.`
        );
      }
    } catch (err) {
      const appError = createAppError(err, 'unknown');
      setError(appError.message);
      showError(appError, "Error In Sign User");
    }
  };

  const getStartParams = () => {
    const tg = window.Telegram.WebApp;
    const startParam = tg?.initDataUnsafe?.start_param;
    if(startParam){
      const parts = startParam.split("_");
      const secretId = parts[0];
      const tabName = parts[1];
      const childId = parts[2] || null;
      console.log(secretId, tabName, childId);
      setDirectLinkData({
        secretId: secretId,
        tabName: tabName as TabType,
        ChildId: childId
      })
    }
  };

useEffect(() => {
  const method = detectAuthMethod();
  switch (method) {
    case "telegram":
      signUserData();
      getStartParams();
      break;

    case "web":
      setIsBrowser(true);
      break;

    default:
      console.warn("Unknown auth method");
  }
}, []);


  const value = {
    userData,
    initDataRaw,
    directLinkData,
    error,
    isBrowser,
    signUserData,
    setUserData,
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
