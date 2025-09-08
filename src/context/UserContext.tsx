import React, { createContext, useContext, useState, useEffect } from "react";
import { DirectLinkData, initDataType, TabType } from "../types/types";
import { signupUser } from "../apiService";
import { MetroSwal } from "../utils/metroSwal";
import { detectAuthMethod } from "../hooks/useContextHelper";


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
    
      if (typeof window === "undefined" || !window.Telegram?.WebApp) {
        setError("Telegram WebApp is not supported");
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      const initData = `query_id=AAGZF7ZmAAAAAJkXtmaMC9RV&user=%7B%22id%22%3A1723209625%2C%22first_name%22%3A%22%D8%AD%D8%B3%D9%8A%D9%86%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22Houssine_A%22%2C%22language_code%22%3A%22ar%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FYWUllIMQmCsMQozU1JvCW2HdmyzGdqp4WuIqlW1fXJE.svg%22%7D&auth_date=1757325100&signature=CDexiWkajyhyJ_-oWjf_bGmePsbNqpureKEzB03eEXLJVLsUY1UkB-TSXRX4TUSTM_FpHHkCprOVthtZ0qc0Dg&hash=398af26e950c2a0ae498fb2c14d9d0a3b7e703789f492c62d53368534eaef988`;
      setInitDataRaw(initData);
      const response = await signupUser(initData);
      setUserData(response);
      if (hasWallet) {
        MetroSwal.success(
          "Welcome!",
          `Hello, ${response.firstName} ${" "}${response.lastName}! We're glad to have you here.`
        );
      }
    try {
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      MetroSwal.error(
        "Error In Sign User",
        err instanceof Error ? err.message : "An error occurred"
      );
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
