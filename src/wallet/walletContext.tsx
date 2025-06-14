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
  const [passwordError, setPasswordError] = useState("");


  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(RPC_URL), []);

  const { initDataRaw } = useUser();

useEffect(() => {
  const encrypted = localStorage.getItem("encryptedSeed");
  if (encrypted) {
    setShowDecryptPrompt(true);
  }
}, []);


async function handleDecrypt() {
  const encrypted = localStorage.getItem("encryptedSeed");
  if (!encrypted) return;

  if (!password) {
    setPasswordError("Password is required");
    return;
  }

  try {
    const fullKey = password + "|" + SALT;
    const decrypted = CryptoJS.AES.decrypt(encrypted, fullKey).toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Decryption failed");

    const wallet = ethers.Wallet.fromMnemonic(decrypted);
    setSigner(wallet.connect(provider));
    setAddress(wallet.address);
    setHasWallet(true);
    setShowDecryptPrompt(false);
    setPassword("");
    setPasswordError("");
  } catch (e) {
    setPasswordError("Wrong password or failed to decrypt wallet.");
  }
}




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
  <>
    <WalletContext.Provider value={{ address, signer, hasWallet, provider, createWalletFlow }}>
      {children}
    </WalletContext.Provider>

    {showDecryptPrompt && (
      <DecryptPrompt
        password={password}
        passwordError={passwordError}
        onChange={setPassword}
        onSubmit={handleDecrypt}
      />
    )}
  </>
);
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
