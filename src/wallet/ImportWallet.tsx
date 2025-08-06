import CryptoJS from "crypto-js";
import { MetroSwal } from "../utils/metroSwal";
import { ethers } from "ethers";

const SALT = process.env.REACT_APP_TG_SECRET_SALT || "default_salt";

export const importWalletFlow = async (
  mnemonic: string,
  identifier: string | null,
  onImported?: (password: string) => void
): Promise<string | null> => {
  
  if (!ethers.utils.isValidMnemonic(mnemonic)) {
    console.error("Invalid mnemonic"); 
    await Swal.fire("Invalid Phrase", "Please check your 12‑word seed phrase.", "error");
    return null;
  }
  
  const { value: password, isConfirmed } = await Swal.fire({
    title: "Set Password",
    input: "password",
    inputLabel: "Enter a strong password to encrypt your wallet",
    inputPlaceholder: "Your password",
    inputAttributes: { autocapitalize: "off", autocorrect: "off" },
    showCancelButton: false,
    allowOutsideClick: false,
    allowEscapeKey: false
  });
  
  if (!isConfirmed || !password) return null;

  const fullKey = password + "|" + SALT;
  const encrypted = CryptoJS.AES.encrypt(mnemonic, fullKey).toString();

  localStorage.setItem(`encryptedSeed-${identifier}`, encrypted);
  localStorage.setItem(`seedBackupDone-${identifier}`, "true");
  localStorage.setItem("savePasswordInBackend", "false");
  
  const savedEncrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
  console.log("Verification - Data saved to localStorage:", savedEncrypted ? "Success" : "Failed"); // إضافة للتصحيح

  if (onImported) {
    onImported(password);
    // Skip showing alert if callback is provided
  } else {
    await Swal.fire("Wallet Imported!", "Your wallet has been securely saved.", "success");
  }
  
  return password;
};
