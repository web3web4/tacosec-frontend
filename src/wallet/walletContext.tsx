import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";
import { storagePublicKeyAndPassword } from "../apiService";
import { useUser } from "../context/UserContext";
import { DecryptPrompt } from "../components/SeedPhrase/DecryptPrompt";
import { ResetPasswordWithSeed } from "../components/SeedPhrase/ResetPasswordWithSeed";

const SALT = process.env.REACT_APP_TG_SECRET_SALT;
const RPC_URL = process.env.REACT_APP_RPC_PROVIDER_URL;

interface WalletContextProps {
  address: string | null;
  signer: ethers.Signer | null;
  hasWallet: boolean;
  provider: ethers.providers.JsonRpcProvider;
  createWalletFlow: () => void;
  restoreWalletFromEncryptedSeed: (
    encryptedSeed: string,
    password: string
  ) => ethers.Wallet | null;
  setSigner: React.Dispatch<React.SetStateAction<ethers.Signer | null>>;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
  setHasWallet: React.Dispatch<React.SetStateAction<boolean>>;
  decryptedPassword?: string;
  setDecryptedPassword: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
}

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

  const provider = useMemo(
    () => new ethers.providers.JsonRpcProvider(RPC_URL),
    []
  );

  const { initDataRaw , userData } = useUser();

  useEffect(() => {
    if (!userData?.telegramId) {
      setHasWallet(false);
      setShowDecryptPrompt(false);
      return;
    }

    const encrypted = localStorage.getItem(`encryptedSeed-${userData.telegramId}`);

    if (encrypted) {
      setHasWallet(true);
      setShowDecryptPrompt(true);
    } else {
      setHasWallet(false);
      setShowDecryptPrompt(false);
    }
  }, [userData?.telegramId]);

  async function createWalletFlow() {
    
    if (!userData?.telegramId) {
      console.warn("User data not ready. Create wallet flow postponed.");
      return;
    }

    const { value: password, isConfirmed } = await Swal.fire({
      title: "Set Password",
      input: "password",
      inputLabel: "Enter a password to encrypt your wallet",
      inputPlaceholder: "Your secure password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (!isConfirmed || !password) {
      Swal.fire(
        "Cancelled",
        "Password is required to create your wallet.",
        "warning"
      );
      return;
    }

    const { isConfirmed: saveConfirmed } = await Swal.fire({
      title: "Save password",
      text: "Do you want to save the wallet password on our servers?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    const saveToBackend = saveConfirmed;
    localStorage.setItem("savePasswordInBackend", saveToBackend.toString());

    const wallet = ethers.Wallet.createRandom();
    setSigner(wallet.connect(provider));
    setAddress(wallet.address);
    localStorage.setItem(`seedBackupDone-${userData?.telegramId}`, "false");

    const mnemonic = wallet.mnemonic.phrase;
    const fullKey = password + "|" + SALT;
    const encrypted = CryptoJS.AES.encrypt(mnemonic, fullKey).toString();
    localStorage.setItem(`encryptedSeed-${userData?.telegramId}`, encrypted);

    if (!initDataRaw) throw new Error("initData is required");

    const data = saveToBackend
      ? { publicKey: wallet.address, secret: password }
      : { publicKey: wallet.address };

    try {
      const response = await storagePublicKeyAndPassword(data, initDataRaw);
      console.log("Wallet data saved to backend successfully:", response);
    } catch (err) {
      console.error("Failed to save wallet data to backend:", err);
    }

    setHasWallet(true);
    promptBackup();
  }

  function restoreWalletFromEncryptedSeed(
    encryptedSeed: string,
    password: string
  ) {
    try {
      const fullKey = password + "|" + SALT;
      const bytes = CryptoJS.AES.decrypt(encryptedSeed, fullKey);
      const decryptedSeed = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedSeed) throw new Error("Failed to decrypt seed");
      return ethers.Wallet.fromMnemonic(decryptedSeed);
    } catch (error) {
      console.error("Error restoring wallet:", error);
      return null;
    }
  }

  function handleDecryption() {
    const encryptedSeed = localStorage.getItem(`encryptedSeed-${userData?.telegramId}`)!;
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

  function promptBackup() {
    import("sweetalert2").then((Swal) => {
      Swal.default
        .fire({
          icon: "warning",
          title: "Backup Required",
          text: "You must backup your wallet seed phrase now.",
          showCancelButton: true,
          confirmButtonText: "Backup now",
          cancelButtonText: "Later",
        })
        .then((result) => {
          if (result.isConfirmed) {
            window.dispatchEvent(new Event("wallet-backup"));
          }
        });
    });
  }

  return (
    <WalletContext.Provider
      value={{
        address,
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
            );
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
