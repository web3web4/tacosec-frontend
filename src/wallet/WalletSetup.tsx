import React, { useEffect, useState } from "react";
import { useWallet } from "./walletContext";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import { MetroSwal } from "../utils/metroSwal";
import { SeedBackupPopup } from "../components/SeedPhrase/SeedPhrase";
import { ConfirmSeedPopup } from "../components/SeedPhrase/ConfirmSeedPopup";
import { DecryptPrompt } from "../components/SeedPhrase/DecryptPrompt";
import { importWalletFlow } from "./ImportWallet";
import { SeedImportPopup } from "../components/SeedPhrase/SeedImportPopup";
import { ResetPasswordWithSeed } from "../components/SeedPhrase/ResetPasswordWithSeed";
import { useUser } from "../context/UserContext";
export default function WalletSetup() {
  const {
    hasWallet,
    createWalletFlow,
    provider,
    restoreWalletFromEncryptedSeed,
    setSigner,
    setAddress,
    setHasWallet,
    decryptedPassword,
    setDecryptedPassword,
  } = useWallet();
  const [showBackup, setShowBackup] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [verifyIndices, setVerifyIndices] = useState<number[] | null>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  console.log("showPasswordPrompt", showPasswordPrompt);
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const [showResetFlow, setShowResetFlow] = useState(false);
  const { userData } = useUser();

  // 🔔 Show alert if no wallet exists

  const showInitialPrompt = () => {
    MetroSwal.fire({
      icon: "info",
      title: "No Wallet Found",
      html: `
      <p style="font-size:14px;">If you already have a wallet, you can import it using your secret phrase.</p>
      <p style="font-size:14px;">Or create a new one to start using our services.</p>
    `,
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonText: "Create Wallet",
      denyButtonText: "Import Wallet",
      allowOutsideClick: false,
      allowEscapeKey: false,
    }).then((result) => {
      if (result.isConfirmed) {
        createWalletFlow();
      } else if (result.isDenied) {
        setShowImport(true);
      }
    });
  };

useEffect(() => {
  // Only proceed if userData is available and there's no wallet yet
  if (userData?.telegramId && !hasWallet) {
    showInitialPrompt();
  }
}, [userData, hasWallet]);

// Existing useEffect can be simplified
useEffect(() => {
  if (!userData?.telegramId) return;
  
  const allKeys = Object.keys(localStorage);
  const otherWalletKey = allKeys.find(
    (key) => key.startsWith("encryptedSeed-") && key !== `encryptedSeed-${userData?.telegramId}`
  );

  if (otherWalletKey) {
    MetroSwal.fire({
      icon: "error",
      title: "Access Denied",
      html: `<p style="font-size:14px;">You are not allowed to access this app using multiple Telegram accounts on the same device.</p>`,
      allowOutsideClick: false,
      allowEscapeKey: false,
    });
  }
}, [userData]);

  const handleImport = (importedMnemonic: string) => {
    importWalletFlow(importedMnemonic, userData, (pwd) => {
      setPassword(pwd);
const encrypted = localStorage.getItem(`encryptedSeed-${userData?.telegramId}`)!;
      const wallet = restoreWalletFromEncryptedSeed(encrypted, pwd);
      if (wallet) {
        setSigner(wallet.connect(provider));
        setAddress(wallet.address);
        setHasWallet(true);
        setDecryptedPassword(pwd);
        MetroSwal.fire("Success", "Wallet restored successfully.", "success");
      }
    });
    setShowImport(false);
  };

  useEffect(() => {
    /**
     * Checks if the user has already backed up their wallet seed phrase.
     * If no wallet exists or the user has already backed up their seed phrase, do nothing.
     * If a wallet exists and the user has not backed up their seed phrase, show the backup prompt.
     */
    const checkBackup = () => {
    const backupDone = localStorage.getItem(`seedBackupDone-${userData?.telegramId}`) === "true";

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
   * Alerts the user if the password is invalid or decryption fails...
   */

  const handleDecrypt = async () => {
const encrypted = localStorage.getItem(`encryptedSeed-${userData?.telegramId}`);
    if (!encrypted) {
      MetroSwal.fire("Error", "No encrypted seed found in localStorage.", "error");
      return;
    }

    const fullKey = password + "|" + process.env.REACT_APP_TG_SECRET_SALT;

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
          localStorage.setItem(`seedBackupDone-${userData?.telegramId}`, "true");
          setShowBackup(false);
          setVerifyIndices(null);
          MetroSwal.fire("✅ Success", "Backup complete", "success");
        }}
        onFailure={() => {
          MetroSwal.fire(
            "❌ Failed",
            "Verification failed, please try again.",
            "error"
          );
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
      <>
        <DecryptPrompt
          password={password}
          passwordError={passwordError}
          onChange={setPassword}
          onSubmit={handleDecrypt}
          onForgotPassword={() => setShowResetFlow(true)}
        />
        {showResetFlow && (
          <ResetPasswordWithSeed
            onSuccess={() => {
              setShowResetFlow(false);
              MetroSwal.fire(
                "Success",
                "You can now unlock your wallet with your new password.",
                "success"
              );
            }}
            onCancel={() => {
              setShowResetFlow(false);
              setShowPasswordPrompt(true); // Re-show the DecryptPrompt when Cancel is clicked
            }}
          />
        )}
      </>
    );
  }

  if (showBackup && mnemonic) {
    return <SeedBackupPopup mnemonic={mnemonic} onConfirm={confirmBackup} />;
  }

  if (showImport) {
    return (
      <SeedImportPopup
        onImport={handleImport}
        onCancel={() => {
          setShowImport(false);
          showInitialPrompt();
        }}
      />
    );
  }

  return null;
}
