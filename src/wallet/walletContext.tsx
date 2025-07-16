import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { ethers } from "ethers";
import { loginUserWeb, storagePublicKeyAndPassword } from "../apiService";
import { useUser } from "../context/UserContext";
import { DecryptPrompt } from "../components/SeedPhrase/DecryptPrompt";
import { ResetPasswordWithSeed } from "../components/SeedPhrase/ResetPasswordWithSeed";

import {
  encryptSeed,
  restoreWallet,
} from "../utils/walletUtils";

import {
  getEncryptedSeed,
  saveEncryptedSeed,
  setSeedBackupDone,
  setSavedPasswordPreference,
  findAddressInStorage,
} from "../localstorage/walletStorage";

import {
  promptPassword,
  confirmSavePassword,
  showBackupReminder,
} from "../hooks/walletDialogs";

import {WalletContextProps} from "../interfaces/wallet"
import Swal from "sweetalert2";

const RPC_URL = process.env.REACT_APP_RPC_PROVIDER_URL;



const WalletContext = createContext<WalletContextProps | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
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

  const { initDataRaw , userData } = useUser();
  const isTelegram = Boolean(userData?.telegramId);
  const isWeb = !isTelegram;

  const identifier = useMemo(() => {
    if (isWeb && addressweb) {
      return addressweb;
    } else if (userData?.telegramId) {
      return userData.telegramId;
    }
    return null;
  }, [isWeb, addressweb, userData?.telegramId]);

  useEffect(() => {
    if (!identifier) return;
    const encrypted = getEncryptedSeed(identifier);
    setHasWallet(!!encrypted);
    setShowDecryptPrompt(!!encrypted);
  }, [identifier]);

  async function createWalletFlow() {
    if (isTelegram && !userData?.telegramId) return;

    const { value: password, isConfirmed } = await promptPassword();
    if (!isConfirmed || !password) {
      await Swal.fire({
        icon: "warning",
        title: "Cancelled",
        html: "Password is required to create your wallet.",
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
      return createWalletFlow();
    }

    const { isConfirmed: saveConfirmed } = await confirmSavePassword();
    const saveToBackend = saveConfirmed;
    setSavedPasswordPreference(saveToBackend);

    const wallet = ethers.Wallet.createRandom();
    setSigner(wallet.connect(provider));
    setAddress(wallet.address);

    if (isWeb) {
      setSeedBackupDone(wallet.address, false);
      try {
        const message = `Login to Taco App: ${Date.now()}`;
        const signature = await wallet.signMessage(message);
        await loginUserWeb(wallet.address, signature);
      } catch (err) {
        console.error("Failed to login with web wallet:", err);
      }
    } else {
      setSeedBackupDone(userData?.telegramId || "", false);
    }

    const mnemonic = wallet.mnemonic.phrase;
    const encrypted = encryptSeed(mnemonic, password);
    saveEncryptedSeed(wallet.address, encrypted);

    if (!initDataRaw && isTelegram) throw new Error("initData is required");

    const data = saveToBackend
      ? { publicKey: wallet.address, secret: password }
      : { publicKey: wallet.address };

    try {
      await storagePublicKeyAndPassword(data, initDataRaw || "");
    } catch (err) {
      console.error("Failed to save wallet data to backend:", err);
    }

    setHasWallet(true);
    showBackupReminder();
  }

  function restoreWalletFromEncryptedSeed(encryptedSeed: string, password: string) {
    return restoreWallet(encryptedSeed, password);
  }

  function handleDecryption() {
    const encryptedSeed = getEncryptedSeed(identifier!);
    if (!encryptedSeed) return;

    const wallet = restoreWalletFromEncryptedSeed(encryptedSeed, password);
    if (wallet) {
      setSigner(wallet.connect(provider));
      setAddress(wallet.address);
      setHasWallet(true);
      setShowDecryptPrompt(false);
      setPasswordError("");
      Swal.fire("Success", "Wallet restored successfully.", "success");
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

      {showResetFlow && (
        <ResetPasswordWithSeed
          onSuccess={() => {
            setShowResetFlow(false);
            Swal.fire(
              "Success",
              "You can now unlock your wallet with your new password.",
              "success"
            ).then(() => {
              window.location.reload();
            });
          }}
          onCancel={() => {
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
