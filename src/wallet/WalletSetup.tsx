import React, { useEffect, useState } from "react";
import { useWallet } from "./walletContext";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { SeedBackupPopup } from "../components/SeedPhrase/SeedPhrase";
import { ConfirmSeedPopup } from "../components/SeedPhrase/ConfirmSeedPopup";
import { DecryptPrompt } from "../components/SeedPhrase/DecryptPrompt";
export default function WalletSetup() {
  const { hasWallet, createWalletFlow , decryptedPassword } = useWallet();
  const [showBackup, setShowBackup] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [verifyIndices, setVerifyIndices] = useState<number[] | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");

   // 🔔 Show alert if no wallet exists
  useEffect(() => {
    if (typeof hasWallet === "boolean" && !hasWallet) {
      Swal.fire({
        icon: "info",
        title: "No Wallet Found",
        text: "You don't have a wallet yet. Would you like to create one?",
        showCancelButton: false,
        confirmButtonText: "Create Wallet",
        cancelButtonText: "Maybe Later",
      }).then((result) => {
        if (result.isConfirmed) {
          createWalletFlow();
        }
      });
    }
    
  }, [hasWallet, createWalletFlow]);



useEffect(() => {
  /**
   * Checks if the user has already backed up their wallet seed phrase.
   * If no wallet exists or the user has already backed up their seed phrase, do nothing.
   * If a wallet exists and the user has not backed up their seed phrase, show the backup prompt.
   */
  const checkBackup = () => {
    const backupDone = localStorage.getItem("seedBackupDone") === "true";

    if (hasWallet && !backupDone) {
      setShowBackup(true);
    }
  };

  checkBackup();
  window.addEventListener("focus", checkBackup); 

  return () => {
    window.removeEventListener("focus", checkBackup);
  };
}, [hasWallet]);



/**
 * Handles the backup process by decrypting the mnemonic seed phrase stored in localStorage.
 * Prompts the user to enter the encryption password and attempts decryption with the provided input.
 * Validates the decrypted phrase to ensure it is a valid mnemonic.
 * If successful, sets the mnemonic state with the decrypted phrase.
 * Alerts the user if the password is invalid or decryption fails.
 */

const handleDecrypt = async () => {

  const encrypted = localStorage.getItem("encryptedSeed");
  if (!encrypted) {
    Swal.fire("Error", "No encrypted seed found in localStorage.", "error");
    return;
  }

const fullKey = password + "|" + (process.env.REACT_APP_TG_SECRET_SALT );

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, fullKey);
    const phrase = bytes.toString(CryptoJS.enc.Utf8);
    if (!ethers.utils.isValidMnemonic(phrase)) throw new Error();

    setMnemonic(phrase);
    setPassword(""); // clear on success
    setShowPasswordPrompt(false); // hide prompt
    setPasswordError("");
  } catch {
    setPasswordError("❌ Invalid password. Please try again.");
  }
};


  
/**
 * Prompts the user to enter 6 random words from the 12 words in the mnemonic seed phrase.
 * Checks if the user input matches the words in the seed phrase.
 * If the user successfully enters the words, sets the "seedBackupDone" flag to true and closes the backup dialog.
 * If the user fails verification, alerts the user to try again.
 */
const confirmBackup = () => {
  const indices = new Set<number>();
  while (indices.size < 4) indices.add(Math.floor(Math.random() * 12));
  setVerifyIndices(Array.from(indices));
};


if (verifyIndices && mnemonic) {
  return (
    <ConfirmSeedPopup
      words={mnemonic.split(" ")}
      indices={verifyIndices}
      onSuccess={() => {
        localStorage.setItem("seedBackupDone", "true");
        setShowBackup(false);
        setVerifyIndices(null);
        Swal.fire("✅ Success", "Backup complete", "success");
      }}
      onFailure={() => {
        Swal.fire("❌ Failed", "Verification failed, please try again.", "error");
        setVerifyIndices(null);
      }}
    />
  );
}


if (showBackup && !mnemonic) {
  if (decryptedPassword) {
    setPassword(decryptedPassword);
    handleDecrypt(); // Use password directly if it's already available
    return null; // prevent double render
  }

  return (
    <DecryptPrompt
      password={password}
      passwordError={passwordError}
      onChange={setPassword}
      onSubmit={handleDecrypt}
    />
  );
}



if (showBackup && mnemonic) {
  return <SeedBackupPopup mnemonic={mnemonic} onConfirm={confirmBackup} />;
}



}
