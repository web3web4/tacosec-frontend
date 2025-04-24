import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDataType } from '../types/types';
import { signupUser } from '../apiService';

interface UserContextType {
  userData: initDataType | null;
  error: string | null;
  signUserData: (initData: initDataType) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

const waitForTelegramWebApp = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const maxWaitTime = 5000;
    const startTime = Date.now();

    const check = () => {
      if (window.Telegram?.WebApp) {
        resolve();
      } else if (Date.now() - startTime > maxWaitTime) {
        reject(new Error('Telegram WebApp is not available'));
      } else {
        setTimeout(check, 100); 
      }
    };

    check();
  });
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<initDataType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const signUserData = async () => {
    setError(null);
    try {
      await waitForTelegramWebApp();

      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      const initData = tg.initData;
      const response = await signupUser(initData);

      setUserData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    signUserData();
  }, []);

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
