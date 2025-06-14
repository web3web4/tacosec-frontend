import React, { useEffect, useState } from "react";
import { useWallet } from "./walletContext";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { SeedBackupPopup } from "../components/SeedPhrase/SeedPhrase";
import { ConfirmSeedPopup } from "../components/SeedPhrase/ConfirmSeedPopup";

export default function WalletSetup() {
  const { hasWallet, createWalletFlow, address } = useWallet();
  const [showBackup, setShowBackup] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
const [verifyIndices, setVerifyIndices] = useState<number[] | null>(null);

   // 🔔 Show alert if no wallet exists
  useEffect(() => {
    if (!hasWallet) {
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
    // invoked when the user is prompted to back up their wallet
    // after wallet creation or password change.
    const handler = () => setShowBackup(true);
    window.addEventListener("wallet-backup", handler);
    return () => window.removeEventListener("wallet-backup", handler);
  }, []);

  
/**
 * Handles the backup process by decrypting the mnemonic seed phrase stored in localStorage.
 * Prompts the user to enter the encryption password and attempts decryption with the provided input.
 * Validates the decrypted phrase to ensure it is a valid mnemonic.
 * If successful, sets the mnemonic state with the decrypted phrase.
 * Alerts the user if the password is invalid or decryption fails.
 */

const handleBackup = async () => {
  const encrypted = localStorage.getItem("encryptedSeed");
  if (!encrypted) {
    Swal.fire("Error", "No encrypted seed found in localStorage.", "error");
    return;
  }

  const { value: password, isConfirmed } = await Swal.fire({
    title: "Enter Password",
    input: "password",
    inputLabel: "Enter your encryption password",
    inputPlaceholder: "Your secure password",
    inputAttributes: {
      autocapitalize: "off",
      autocorrect: "off",
    },
    showCancelButton: false,
    confirmButtonText: "Decrypt",
  });

  if (!isConfirmed || !password) {
    Swal.fire("Cancelled", "Decryption cancelled by user.", "info");
    return;
  }

  const fullKey = password + "|" + address + "|" + (process.env.REACT_APP_TG_SECRET_SALT || "default_salt");

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, fullKey);
    const phrase = bytes.toString(CryptoJS.enc.Utf8);
    if (!ethers.utils.isValidMnemonic(phrase)) throw new Error();

    setMnemonic(phrase);
  } catch {
    Swal.fire("Error", "Invalid password or corrupted data.", "error");
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
  while (indices.size < 6) indices.add(Math.floor(Math.random() * 12));
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

  if (showBackup && mnemonic) {
    return <SeedBackupPopup mnemonic={mnemonic} onConfirm={confirmBackup} />;
  }

  if (showBackup && !mnemonic) {
    handleBackup();
    return <p>Decrypting your seed...</p>;
  }





}
