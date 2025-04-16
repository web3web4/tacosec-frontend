import React, { createContext, useContext, useMemo } from "react";
import { ethers } from "ethers";
import UserWallet from "./useUserWallet";

const WalletContext = createContext<{
  signer: ethers.Signer | null;
  address: string | null;
  privateKey: string | null;
  provider: ethers.providers.JsonRpcProvider ;
} | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const dataUser = { username: "testuser", id: 123456 };

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(process.env.REACT_APP_RPC_PROVIDER_URL), []);


  const { signer, address, privateKey } = UserWallet(dataUser, provider);

  const value = useMemo(
    () => ({
      signer,
      address,
      privateKey: privateKey ?? null,
      provider,
    }),
    [signer, address, privateKey, provider]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within WalletProvider");
  return context;
}
