import { useMemo } from "react";
import { ethers, providers } from "ethers"; 
const { keccak256, toUtf8Bytes } = ethers.utils;

const SALT = process.env.REACT_APP_TG_SECRET_SALT;

interface TelegramUser {
  username?: string;
  id?: number;
}

function generateWalletFromTelegramUser(user: TelegramUser, provider: providers.Provider) {
  const normalized = `${user.username?.trim().toLowerCase()}${user.id}`;
  const seed = keccak256(toUtf8Bytes(normalized + SALT));
  return new ethers.Wallet(seed, provider);
}

export default function UserWallet(user: TelegramUser, provider: providers.Provider) {
  const wallet = useMemo(() => {
    if (!user?.username || !user?.id) return null;
    try {
      return generateWalletFromTelegramUser(user, provider);
    } catch (e) {
      console.error("Failed to generate wallet", e);
      return null;
    }
  }, [user, provider]);

  return {
    wallet,
    address: wallet?.address ?? null,
    privateKey: wallet?.privateKey,
    signer: wallet,
  };
}
