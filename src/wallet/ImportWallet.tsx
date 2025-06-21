import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import { initDataType } from "../types/types";

const SALT = process.env.REACT_APP_TG_SECRET_SALT || "default_salt";

export const importWalletFlow = async (
  mnemonic: string,
  userData: initDataType | null,
  onImported?: (password: string) => void
) => {
  if (!ethers.utils.isValidMnemonic(mnemonic)) {
    await Swal.fire("Invalid Phrase", "Please check your 12‑word seed phrase.", "error");
    return;
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
  if (!isConfirmed || !password) return;

  const fullKey = password + "|" + SALT;
  const encrypted = CryptoJS.AES.encrypt(mnemonic, fullKey).toString();

    localStorage.setItem(`encryptedSeed-${userData?.telegramId}`, encrypted);
    localStorage.setItem(`seedBackupDone-${userData?.telegramId}`, "true");
    localStorage.setItem("savePasswordInBackend", "false");


  if (onImported) {
    onImported(password);
  }

  await Swal.fire("Wallet Imported!", "Your wallet has been securely saved.", "success");
};
