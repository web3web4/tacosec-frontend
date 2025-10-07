import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { config } from "@/utils/config";

const SALT = config.TG_SECRET_SALT;

export function encryptSeed(mnemonic: string, password: string): string {
  const key = password + "|" + SALT;
  return CryptoJS.AES.encrypt(mnemonic, key).toString();
}

export function decryptSeed(encrypted: string, password: string): string | null {
  try {
    const key = password + "|" + SALT;
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    console.log("Error decrypting seed:", error);
    return null;
  }
}

export function restoreWallet(encrypted: string, password: string): ethers.Wallet | null {
  const decryptedMnemonic = decryptSeed(encrypted, password);
  if (!decryptedMnemonic) return null;

  try {
    return ethers.Wallet.fromMnemonic(decryptedMnemonic);
  } catch {
    return null;
  }
}
