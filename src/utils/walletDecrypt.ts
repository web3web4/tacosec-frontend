import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import { config } from "@/utils/config";

export function decryptMnemonic(encrypted: string, password: string): string | null {
  const salt = config.TG_SECRET_SALT;
  const fullKey = `${password}|${salt}`;
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, fullKey);
    const phrase = bytes.toString(CryptoJS.enc.Utf8);
    return ethers.utils.isValidMnemonic(phrase) ? phrase : null;
  } catch {
    return null;
  }
}
