import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { loginUserWeb, storagePublicKeyAndPassword } from "@/apiService";
import { DecryptPrompt, ResetPasswordWithSeed } from "@/components";
import { encryptSeed, restoreWallet } from "@/utils";
import { useUser } from "@/context";
import { ethers } from "ethers";
import {
  getEncryptedSeed,
  saveEncryptedSeed,
  setSeedBackupDone,
  setSavedPasswordPreference,
  findAddressInStorage,
} from "@/localstorage/walletStorage";
import {
  showBackupReminder,
  promptPasswordWithSaveOption,
} from "@/hooks/walletDialogs";

import { WalletContextProps } from "@/interfaces/wallet"
import { MetroSwal, handleSilentError , config } from "@/utils";

const RPC_URL = config.RPC_PROVIDER_URL;



const WalletContext = createContext<WalletContextProps | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  // Initialize address from storage on mount
  const [address, setAddress] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      // Try to get from publicAddress first, then from encryptedSeed keys
      const storedAddress = localStorage.getItem('publicAddress');
      if (storedAddress) return storedAddress;
      return findAddressInStorage();
    }
    return null;
  });
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [showDecryptPrompt, setShowDecryptPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [decryptedPassword, setDecryptedPassword] = useState<string | undefined>("");
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [addressweb, setAddressweb] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return findAddressInStorage();
    }
    return null;
  });

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(RPC_URL), []);

  const { initDataRaw, userData } = useUser();
  const isTelegram = Boolean(userData?.user?.telegramId);
  const isWeb = !isTelegram;

  const identifier = useMemo(() => {
    if (isWeb && (address || addressweb)) {
      return address || addressweb;
    } else if (userData?.user?.telegramId) {
      return userData.user.telegramId;
    }
    return null;
  }, [isWeb, address, addressweb, userData?.user?.telegramId]);

  // Keep address and addressweb in sync for web users
  useEffect(() => {
    if (!isWeb) return;
    
    // If address is set but addressweb is different or null, sync addressweb
    if (address && address !== addressweb) {
      setAddressweb(address);
      if (!localStorage.getItem('publicAddress')) {
        localStorage.setItem('publicAddress', address);
      }
    }
    // If addressweb is set but address is null, sync address
    else if (addressweb && !address) {
      setAddress(addressweb);
      if (!localStorage.getItem('publicAddress')) {
        localStorage.setItem('publicAddress', addressweb);
      }
    }
  }, [isWeb, address, addressweb]);

  useEffect(() => {
    // For web users, try to find identifier even if it's not set in the memo yet
    let currentIdentifier = identifier;
    if (!currentIdentifier && isWeb) {
      currentIdentifier = address || addressweb;
    }
    
    if (!currentIdentifier) return;
    
    const encrypted = getEncryptedSeed(currentIdentifier);
    setHasWallet(!!encrypted);
    
    // Show decrypt prompt if:
    // 1. There's an encrypted seed (wallet exists)
    // 2. Wallet is not unlocked (no signer) - meaning we need to decrypt
    const recentWalletCreation = sessionStorage.getItem('recentWalletCreation');
    
    // If there's an encrypted seed but no signer, we need to decrypt
    // Clear recentWalletCreation flag on page load if wallet needs to be unlocked
    if (encrypted && !signer) {
      // Clear the flag if we're refreshing and the wallet isn't unlocked
      // This ensures the prompt shows after refresh, even if recentWalletCreation was set
      if (recentWalletCreation) {
        sessionStorage.removeItem('recentWalletCreation');
      }
      setShowDecryptPrompt(true);
    } else {
      setShowDecryptPrompt(false);
    }
  }, [identifier, signer, isWeb, address, addressweb]);

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
    // Sync addressweb for web users
    if (isWeb) {
      setAddressweb(wallet.address);
    }
    const mnemonic = wallet.mnemonic.phrase;
    const encrypted = encryptSeed(mnemonic, password);
    localStorage.setItem('publicAddress', wallet.address || "");
    if (isWeb) {
      setSeedBackupDone(wallet.address, false);

      try {
        const message = `Login to Taco App: ${Date.now()}`;
        const signature = await wallet.signMessage(message);
        await loginUserWeb(wallet.address, signature);
        saveEncryptedSeed(wallet.address, encrypted);
      } catch (err) {
        handleSilentError(err, 'loginUserWeb');
      }
    } else {
      setSeedBackupDone(userData?.user?.telegramId || "", false);
    saveEncryptedSeed(userData?.user?.telegramId || "", encrypted);
    }

    if (!initDataRaw && isTelegram) throw new Error("initData is required");

    const data = saveToBackend
      ? { publicKey: wallet.address, secret: password }
      : { publicKey: wallet.address };

    try {
      await storagePublicKeyAndPassword(data, initDataRaw || "");
    } catch (err) {
      handleSilentError(err, 'storagePublicKeyAndPassword');
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

  function handleDecryption() {
    const encryptedSeed = getEncryptedSeed(identifier!);
    if (!encryptedSeed) {
      setPasswordError("Encrypted seed not found. Please refresh the page.");
      return;
    }

    const wallet = restoreWalletFromEncryptedSeed(encryptedSeed, password);
    if (wallet) {
      const walletSigner = wallet.connect(provider);
      setSigner(walletSigner);
      setAddress(wallet.address);
      // Sync addressweb for web users
      if (isWeb) {
        setAddressweb(wallet.address);
        localStorage.setItem('publicAddress', wallet.address);
      }
      setHasWallet(true);
      setShowDecryptPrompt(false);
      setPasswordError("");
      
      // Clear the recent wallet creation flag since user successfully decrypted
      sessionStorage.removeItem('recentWalletCreation');
      
      // Clear password field after successful decryption
      setPassword("");
      
      MetroSwal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Wallet restored successfully.'
      });
      setDecryptedPassword(password);
    } else {
      setPasswordError("Password incorrect or failed to restore wallet.");
    }
  }

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
      }}
    >
      {children}

      {showDecryptPrompt && (
        <DecryptPrompt
          password={password}
          passwordError={passwordError}
          onChange={setPassword}
          onSubmit={handleDecryption}
          onForgotPassword={() => {
            setShowDecryptPrompt(false);
            setShowResetFlow(true);
          }}
          onHidePrompt={(show) => {
            setShowDecryptPrompt(show === true);
          }}
        />
      )}

      {showResetFlow &&
        (
          <ResetPasswordWithSeed
            onSuccess=
            {() => {
              setShowResetFlow(false);
              MetroSwal.fire({
                icon: 'success',
                title: 'Success',
                text: 'You can now unlock your wallet with your new password.'
              }).then(() => {
                window.location.reload();
              })

            }}
            onCancel=
            {() => {
              setShowResetFlow(false);
              setShowDecryptPrompt(true);
            }}
          />
        )}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
