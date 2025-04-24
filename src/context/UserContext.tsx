import React, { createContext, useContext, useState, useEffect } from 'react';
import { initDataType } from '../types/types';
import { signupUser } from '../apiService';

interface UserContextType {
  userData: initDataType | null;
  error: string | null;
  verifyUserData: (initData: initDataType) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<initDataType | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verifyUserData = async () => {
    setError(null);
    try {
      const tg = window.Telegram.WebApp;
        tg.expand();
        const initData = tg.initData;
      const response = await signupUser(initData);
      setUserData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    verifyUserData();
  },[]);

  const value = {
    userData,
    error,
    verifyUserData,
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