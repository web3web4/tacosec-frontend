import { ethers } from "ethers";
import { loginUserWeb, storagePublicKeyAndPassword } from "@/apiService";
import { importWalletFlow } from "@/wallet/ImportWallet";
import { initDataType } from "@/types/types";
import { handleSilentError } from "@/utils";

type ImportParams = {
  importedMnemonic: string;
  isBrowser: boolean;
  userData: initDataType | null;
  address: string | null;
  addressweb: string | null;
  provider: ethers.providers.Provider;
  restoreWalletFromEncryptedSeed: (encrypted: string, password: string) => ethers.Wallet | null;
  setSigner: (s: ethers.Signer) => void;
  setAddress: (a: string) => void;
  setHasWallet: (v: boolean) => void;
  setDecryptedPassword: (pwd: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
  providedPassword?: string;
  providedSavePassword?: boolean;
  initDataRaw?: string | null;
};

export async function handleWalletImport({
  importedMnemonic,
  isBrowser,
  userData,
  address,
  addressweb,
  provider,
  restoreWalletFromEncryptedSeed,
  setSigner,
  setAddress,
  setHasWallet,
  setDecryptedPassword,
  onDone,
  onError,
  providedPassword,
  providedSavePassword,
  initDataRaw,
}: ImportParams) {
  try {
    let identifier = isBrowser ? (address || addressweb) : userData?.user?.telegramId!;

    if (!identifier && isBrowser) {
      identifier = "web-" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("browser-user-id", identifier);
    }

    const password = await importWalletFlow(
      importedMnemonic, 
      identifier, 
      undefined, // onImported callback
      providedPassword, 
      providedSavePassword
    );
    if (!password) {
      onError?.("No password returned from import.");
      return;
    }

    const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
    if (!encrypted) {
      onError?.("Encrypted seed not found.");
      return;
    }

    const wallet = restoreWalletFromEncryptedSeed(encrypted, password);
    if (!wallet) {
      onError?.("Wallet restoration failed.");
      return;
    }

    setSigner(wallet.connect(provider));
    setAddress(wallet.address);
    setHasWallet(true);
    setDecryptedPassword(password);

    if (isBrowser) {
      try {
        const message = `Login to Taco App: ${Date.now()}`;
        const signature = await wallet.signMessage(message);
        await loginUserWeb(wallet.address, signature);
      } catch (err) {
        console.error("Web login failed:", err);
      }

      if (identifier !== wallet.address) {
        localStorage.setItem(`encryptedSeed-${wallet.address}`, encrypted);
        localStorage.setItem(`seedBackupDone-${wallet.address}`, "true");
        localStorage.setItem("publicAddress", wallet.address || "");
        localStorage.removeItem(`encryptedSeed-${identifier}`);
        localStorage.removeItem(`seedBackupDone-${identifier}`);
        localStorage.removeItem("browser-user-id");
      }
    }

    // After successful import and authentication, call storagePublicKeyAndPassword
    // Only send the public address (not the password) when importing from one place to another
    try {
      // Call storagePublicKeyAndPassword with only the public key (no secret/password)
      // This is for cross-platform wallet import (web to Telegram or vice versa)
      // For web users, authentication is already set up via loginUserWeb
      // For Telegram users, initDataRaw is passed for authentication
      await storagePublicKeyAndPassword(
        { publicKey: wallet.address },
        initDataRaw || ""
      );
    } catch (err) {
      // Silently handle errors - don't block the import process if storage fails
      handleSilentError(err, 'storagePublicKeyAndPassword on import');
    }

    onDone?.();
    window.dispatchEvent(new Event("wallet-imported"));
  } catch (error) {
    console.error("handleWalletImport error:", error);
    onError?.("Unexpected import error occurred.");
  }
}
