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

const SALT = process.env.REACT_APP_TG_SECRET_SALT ;
const RPC_URL = process.env.REACT_APP_RPC_PROVIDER_URL ;

interface WalletContextProps {
  address: string | null;
  signer: ethers.Signer | null;
  hasWallet: boolean;
  provider: ethers.providers.JsonRpcProvider;
  createWalletFlow: () => void;
}

const WalletContext = createContext<WalletContextProps | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [hasWallet, setHasWallet] = useState<boolean>(false);
  const [showDecryptPrompt, setShowDecryptPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string>("");

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(RPC_URL), []);

  const { initDataRaw } = useUser();

  useEffect(() => {
    const encrypted = localStorage.getItem("encryptedSeed");
    if (encrypted) {
      setHasWallet(true);
      setShowDecryptPrompt(true);
    } else {
      setHasWallet(false);
    }
  }, []);

  async function createWalletFlow() {
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
  });

  // 2. 
  if (!isConfirmed || !password) {
    Swal.fire("Cancelled", "Password is required to create your wallet.", "warning");
    return;
  }

  // 3.
  const { isConfirmed: saveConfirmed } = await Swal.fire({
    title: "Save password",
    text: "Do you want to save the wallet password on our servers?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  });

  const saveToBackend = saveConfirmed;
  localStorage.setItem("savePasswordInBackend", saveToBackend.toString());

    const wallet = ethers.Wallet.createRandom();
    setSigner(wallet.connect(provider)); // Connect the wallet to the provider
    setAddress(wallet.address);
    localStorage.setItem("seedBackupDone", "false");


    const mnemonic = wallet.mnemonic.phrase;
    const fullKey = password + "|" + SALT ;
    const encrypted = CryptoJS.AES.encrypt(mnemonic, fullKey).toString();
    localStorage.setItem("encryptedSeed", encrypted);

    if (!initDataRaw) {
      throw new Error("initData is required");
    }

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

    function restoreWalletFromEncryptedSeed(encryptedSeed: string, password: string) {
    try {
      const fullKey = password + "|" + SALT;
      const bytes = CryptoJS.AES.decrypt(encryptedSeed, fullKey);
      const decryptedSeed = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedSeed) {
        throw new Error("Failed to decrypt seed. Wrong password?");
      }

      const wallet = ethers.Wallet.fromMnemonic(decryptedSeed);
      return wallet;
    } catch (error) {
      console.error("Error restoring wallet:", error);
      return null;
    }
  }

    function handleDecrypt() {
    const encryptedSeed = localStorage.getItem("encryptedSeed")!;
    const wallet = restoreWalletFromEncryptedSeed(encryptedSeed, password);

    if (wallet) {
      setSigner(wallet.connect(provider));
      setAddress(wallet.address);
      setHasWallet(true);
      setShowDecryptPrompt(false);
      setPasswordError("");
    } else {
      setPasswordError("Password incorrect or failed to restore wallet.");
    }
  }

  function promptBackup() {
    import("sweetalert2").then(Swal => {
      Swal.default.fire({
        icon: "warning",
        title: "Backup Required",
        text: "You must backup your wallet seed phrase now.",
        showCancelButton: true,
        confirmButtonText: "Backup now",
        cancelButtonText: "Later"
      }).then(result => {
        if (result.isConfirmed) {
          window.dispatchEvent(new Event("wallet-backup"));
        }
      });
    });
  }

  return (
    <WalletContext.Provider
      value={{ address, signer, hasWallet, provider, createWalletFlow }}
    >
      {children}

      {showDecryptPrompt && (
        <DecryptPrompt
          password={password}
          passwordError={passwordError}
          onChange={setPassword}
          onSubmit={handleDecrypt}
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
