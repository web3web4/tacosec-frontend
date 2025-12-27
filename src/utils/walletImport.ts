import { ethers } from "ethers";
import { getChallangeForLogin, loginUserWeb, publicAddressChallange, storagePublicKeyAndPassword } from "@/services";
import { importWalletFlow } from "@/wallet/ImportWallet";
import { initDataType } from "@/types/types";
import { handleSilentError, removeBrowserUserId, removeEncryptedSeed, removeSeedBackupDone, saveEncryptedSeed, setPublicAddressInStorage, setSeedBackupDone } from "@/utils";

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
        const challangeForLogin = await getChallangeForLogin(wallet.address);
        const message = challangeForLogin.challange;
        const signature = await wallet.signMessage(message);
        if (!signature) throw new Error("signature is required");
        await loginUserWeb(wallet.address, signature);
      } catch (err) {
        console.error("Web login failed:", err);
        throw err;
      }

      // save wallet data with wallet address as key for browser users
      // This ensures data persists after refresh
      saveEncryptedSeed(wallet.address, encrypted);
      setSeedBackupDone(wallet.address, true);
      setPublicAddressInStorage(wallet.address || "");
      
      // If identifier was different from wallet address, clean up old keys
      if (identifier !== wallet.address) {
        removeEncryptedSeed(identifier || "");
        removeSeedBackupDone(identifier || "");
        removeBrowserUserId();
      }
      
      // Ensure savePasswordInBackend is saved if provided
      if (providedSavePassword !== undefined) {
        localStorage.setItem("savePasswordInBackend", providedSavePassword.toString());
      }
    } else {
      // For Telegram users, always save wallet data with telegramId as key
      // This ensures data persists after refresh
      const telegramId = userData?.user?.telegramId;
      if (telegramId) {
        localStorage.setItem(`encryptedSeed-${telegramId}`, encrypted);
        localStorage.setItem(`seedBackupDone-${telegramId}`, "true");
        
        // If identifier was different from telegramId, clean up old keys
        if (identifier !== telegramId) {
          localStorage.removeItem(`encryptedSeed-${identifier}`);
          localStorage.removeItem(`seedBackupDone-${identifier}`);
        }
      }
      
      // Ensure savePasswordInBackend is saved if provided
      if (providedSavePassword !== undefined) {
        localStorage.setItem("savePasswordInBackend", providedSavePassword.toString());
      }
    }

    // After successful import and authentication, call storagePublicKeyAndPassword
    // Only send the public address (not the password) when importing from one place to another
    try {
      // Generate signature for wallet import verification
      const publicAddressChallangeResponse = await publicAddressChallange(wallet.address , initDataRaw || "");
      const message = publicAddressChallangeResponse.data.challange;
      const signature = await wallet.signMessage(message);
      if (!signature) throw new Error("signature is required");
      // Call storagePublicKeyAndPassword with public key and signature
      // This is for cross-platform wallet import (web to Telegram or vice versa)
      // For web users, authentication is already set up via loginUserWeb
      // For Telegram users, initDataRaw is passed for authentication
      await storagePublicKeyAndPassword(
        { publicKey: wallet.address, signature },
        initDataRaw || ""
      );
    } catch (err) {
      // Silently handle errors - don't block the import process if storage fails
      handleSilentError(err, 'storagePublicKeyAndPassword on import');
      throw err;
    }

    onDone?.();
    window.dispatchEvent(new Event("wallet-imported"));
  } catch (error) {
    console.error("handleWalletImport error:", error);
    onError?.("Unexpected import error occurred.");
  }
}
