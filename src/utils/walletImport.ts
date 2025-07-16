import { ethers } from "ethers";
import { loginUserWeb } from "../apiService";
import { importWalletFlow } from "../wallet/ImportWallet";

type ImportParams = {
  importedMnemonic: string;
  isBrowser: boolean;
  userData: any;
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
}: ImportParams) {
  try {
    let identifier = isBrowser ? (address || addressweb) : userData?.telegramId;

    if (!identifier && isBrowser) {
      identifier = "web-" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("browser-user-id", identifier);
    }

    const password = await importWalletFlow(importedMnemonic, identifier);
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
        localStorage.removeItem(`encryptedSeed-${identifier}`);
        localStorage.removeItem(`seedBackupDone-${identifier}`);
        localStorage.removeItem("browser-user-id");
      }
    }

    onDone?.();
    window.dispatchEvent(new Event("wallet-imported"));
  } catch (error) {
    console.error("handleWalletImport error:", error);
    onError?.("Unexpected import error occurred.");
  }
}
