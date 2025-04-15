import { useMemo } from "react";
import { ethers } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers";


const SALT = process.env.REACT_APP_TG_SECRET_SALT;

interface TelegramUser {
  username?: string;
  id?: number;
}

function generateWalletFromTelegramUser(user: TelegramUser) {
  const normalized = `${user.username?.trim().toLowerCase()}${user.id}`;
  const seed = keccak256(toUtf8Bytes(normalized + SALT));
  return new ethers.Wallet(seed);
}

export default function UserWallet(user?: TelegramUser) {
  const wallet = useMemo(() => {
    if (!user?.username || !user?.id) return null;
    try {
      return generateWalletFromTelegramUser(user);
    } catch (e) {
      console.error("Failed to generate wallet", e);
      return null;
    }
  }, [user]);

  return {
    wallet,
    address: wallet?.address,
    privateKey: wallet?.privateKey,
    signer: wallet,
  };
}
