import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDataType } from '../types/types';
import { signupUser } from '../apiService';
import Swal from 'sweetalert2';

interface UserContextType {
  userData: initDataType | null;
  error: string | null;
  signUserData: (initData: initDataType) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<initDataType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false); 

  const signUserData = async () => {
    setError(null);
    try {
      if (typeof window === "undefined" || !window.Telegram?.WebApp) {
        setError("Telegram WebApp is not supported");
        return;
      }

      const tg = window.Telegram.WebApp;
      tg.ready();
      const initData = tg.initData;
      if (!initData) {
        throw new Error("Telegram WebApp data is missing");
      }

      const response = await signupUser(initData);
      setUserData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error!,
      });
    }
  };

  useEffect(() => {
    const checkWebAppReady = () => {
      if (typeof window !== "undefined" && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        if (tg && tg.initData) {
          setIsReady(true);
        }
      }
    };

    const intervalId = setInterval(() => {
      checkWebAppReady();
    }, 1000);

    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      setError("WebApp took too long to load");
    }, 100000);

    if (isReady) {
      signUserData();
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isReady]);

  const value = {
    userData,
    error,
    signUserData,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
