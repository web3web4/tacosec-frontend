import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { loginUserWeb, storagePublicKeyAndPassword, getChallangeForLogin, publicAddressChallange } from "@/services";
import { encryptSeed, restoreWallet } from "@/utils";
import { useUser } from "@/context";
import { ethers } from "ethers";
import {
  getEncryptedSeed,
  saveEncryptedSeed,
  setSeedBackupDone,
  setSavedPasswordPreference,
  findAddressInStorage,
  setPublicAddressInStorage,
  getPublicAddressInStorage,
} from "@/localstorage/walletStorage";
import {
  showBackupReminder,
  promptPasswordWithSaveOption,
} from "@/hooks/walletDialogs";

import { WalletContextProps } from "@/types/wallet"
import { MetroSwal, handleSilentError, config } from "@/utils";
import CryptoJS from 'crypto-js';

const RPC_URL = config.RPC_PROVIDER_URL;



const WalletContext = createContext<WalletContextProps | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Initialize address from storage on mount
  // For web users, address serves as the primary identifier
  // For Telegram users, telegramId is used as identifier
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      // Try to get from publicAddress first, then from encryptedSeed keys
      const storedAddress = getPublicAddressInStorage();
      if (storedAddress) return storedAddress;
      return findAddressInStorage();
    }
    return null;
  });
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [decryptedPassword, setDecryptedPassword] = useState<string | undefined>("");

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(RPC_URL), []);

  const { initDataRaw, userData } = useUser();
  const isTelegram = Boolean(userData?.user?.telegramId);
  const isWeb = !isTelegram;

  // For backward compatibility, addressweb is derived from address for web users
  // This maintains the existing API while eliminating redundant state
  const addressweb = useMemo(() => {
    return isWeb ? address : null;
  }, [isWeb, address]);

  // Compute identifier based on platform: address for web, telegramId for Telegram
  const identifier = useMemo(() => {
    if (isWeb && address) {
      return address;
    } else if (userData?.user?.telegramId) {
      return userData.user.telegramId;
    }
    return null;
  }, [isWeb, address, userData?.user?.telegramId]);

  // Check if wallet exists and update hasWallet state
  useEffect(() => {
    if (!identifier) return;

    const encrypted = getEncryptedSeed(identifier);
    setHasWallet(!!encrypted);
    
    // Note: Decrypt prompt is now handled by WalletSetup.tsx using OnboardingFlow
    // We just need to ensure hasWallet state is correct
  }, [identifier]);

  async function createWalletFlow() {
    if (isTelegram && !userData?.user?.telegramId) return;

    // Use the new merged password dialog
    const { isConfirmed, value: password, savePassword } = await promptPasswordWithSaveOption();

    if (!isConfirmed || !password) {
      await MetroSwal.fire({
        icon: "warning",
        title: "Cancelled",
        html: "Password is required to create your wallet.",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      return createWalletFlow();
    }

    // Use the new function with provided password
    return createWalletWithPassword(password, savePassword);
  }

  async function createWalletWithPassword(password: string, saveToBackend: boolean, skipBackupReminder: boolean = false) {
    if (isTelegram && !userData?.user?.telegramId) return;

    setSavedPasswordPreference(saveToBackend);

    const wallet = ethers.Wallet.createRandom();
    setSigner(wallet.connect(provider));
    setAddress(wallet.address);
    // addressweb is now derived from address via useMemo, no need to set separately
    const mnemonic = wallet.mnemonic.phrase;
    const encrypted = encryptSeed(mnemonic, password);
    setPublicAddressInStorage(wallet.address || "");
    if (isWeb) {
      setSeedBackupDone(wallet.address, false);

      try {
        const challangeForLogin = await getChallangeForLogin(wallet.address);
        const message = challangeForLogin.challange;
        const signature = await wallet.signMessage(message);
        if (!signature) throw new Error("Signature is required");
        await loginUserWeb(wallet.address, signature);
        saveEncryptedSeed(wallet.address, encrypted);
      } catch (err) {
        handleSilentError(err, 'getChallangeForLogin');
        handleSilentError(err, 'loginUserWeb');
        throw err;
      }
    } else {
      setSeedBackupDone(userData?.user?.telegramId || "", false);
      saveEncryptedSeed(userData?.user?.telegramId || "", encrypted);
    }

    if (!initDataRaw && isTelegram) throw new Error("initData is required");
    

    const publicAddressChallangeResponse = await publicAddressChallange(wallet.address , initDataRaw || "");
    const message = publicAddressChallangeResponse.data.challange;
    const signature = await wallet.signMessage(message);

    if (!signature) throw new Error("signature is required");

    const data = saveToBackend
      ? (() => {
        // Encrypt password using public key + SALT for secure transmission
        const SALT = config.TG_SECRET_SALT || "default_salt";
        const encryptionKey = wallet.address + "|" + SALT;
        const encryptedPassword = CryptoJS.AES.encrypt(password, encryptionKey).toString();
        return { publicKey: wallet.address, signature:signature , secret: encryptedPassword };
      })()
      : { publicKey: wallet.address , signature:signature };

    try {
      await storagePublicKeyAndPassword(data, initDataRaw || "");
    } catch (err) {
      handleSilentError(err, 'storagePublicKeyAndPassword');
      throw err;
    }

    setHasWallet(true);

    // Mark as recent wallet creation to prevent decrypt prompt
    sessionStorage.setItem('recentWalletCreation', 'true');

    // Only show backup reminder if not skipped (for onboarding flow)
    if (!skipBackupReminder) {
      showBackupReminder();
    }

    return { wallet, mnemonic };
  }

  function restoreWalletFromEncryptedSeed(encryptedSeed: string, password: string) {
    return restoreWallet(encryptedSeed, password);
  }

  // Decryption is now handled by OnboardingFlow in WalletSetup.tsx

  return (
    <WalletContext.Provider
      value={{
        address,
        addressweb,
        signer,
        hasWallet,
        provider,
        createWalletFlow,
        createWalletWithPassword,
        decryptedPassword,
        restoreWalletFromEncryptedSeed,
        setSigner,
        setAddress,
        setHasWallet,
        setDecryptedPassword,
        // Note: addressweb is kept for backward compatibility but is now derived from address
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
