import React, {
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

const SALT = process.env.REACT_APP_TG_SECRET_SALT || "default_salt";
const RPC_URL = process.env.REACT_APP_RPC_PROVIDER_URL || "https://rpc.example.com";

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

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider(RPC_URL), []);

  const { initDataRaw } = useUser();

  useEffect(() => {
    const encrypted = localStorage.getItem("encryptedSeed");
    setHasWallet(!!encrypted);
  }, []);

  async function createWalletFlow() {
    const { isConfirmed } = await Swal.fire({
      title: "Save password to backend?",
      text: "Do you want to save the wallet password on our servers?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    });

    const saveToBackend = isConfirmed;
    localStorage.setItem("savePasswordInBackend", saveToBackend.toString());

    const wallet = ethers.Wallet.createRandom();
    setSigner(wallet.connect(provider)); // Connect the wallet to the provider
    setAddress(wallet.address);
    localStorage.setItem("seedBackupDone", "false");

    const { value: password } = await Swal.fire({
      title: "Set Password",
      input: "password",
      inputLabel: "Enter a password to encrypt your wallet",
      inputPlaceholder: "Your secure password",
      inputAttributes: {
        autocapitalize: "off",
        autocorrect: "off",
      },
      showCancelButton: true,
    });

    if (!password) {
      Swal.fire("Error", "Password is required to secure your wallet.", "error");
      return;
    }

    const mnemonic = wallet.mnemonic.phrase;
    const fullKey = password + "|" + wallet.address + "|" + SALT;
    const encrypted = CryptoJS.AES.encrypt(mnemonic, fullKey).toString();
    localStorage.setItem("encryptedSeed", encrypted);

    if (!initDataRaw) {
      throw new Error("initData is required");
    }

    const data = saveToBackend
      ? { address: wallet.address, password }
      : { address: wallet.address };

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
    <WalletContext.Provider
      value={{ address, signer, hasWallet, provider, createWalletFlow }}
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
