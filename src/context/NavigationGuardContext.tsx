import React, { createContext, useContext, useState } from "react";

type NavigationCheck = () => boolean;

type NavigationGuardContextType = {
  setNavigationCheck: (fn: NavigationCheck) => void;
  runNavigationCheck: () => boolean;
};

const NavigationGuardContext = createContext<NavigationGuardContextType | undefined>(undefined);

export const NavigationGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [navigationCheck, setNavigationCheckState] = useState<NavigationCheck | null>(null);

  const setNavigationCheck = (fn: NavigationCheck) => {
    setNavigationCheckState(() => fn);
  };

  const runNavigationCheck = () => {
    return navigationCheck ? navigationCheck() : false;
  };

  return (
    <NavigationGuardContext.Provider value={{ setNavigationCheck, runNavigationCheck }}>
      {children}
    </NavigationGuardContext.Provider>
  );
};

export const useNavigationGuard = () => {
  const context = useContext(NavigationGuardContext);
  if (!context) {
    throw new Error("useNavigationGuard must be used within NavigationGuardProvider");
  }
  return context;
};
