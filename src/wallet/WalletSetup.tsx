import React, { useEffect, useState } from "react";
import { useWallet } from "./walletContext";
import Swal from "sweetalert2";
import { SeedBackupPopup } from "../components/SeedPhrase/SeedPhrase";
import { ConfirmSeedPopup } from "../components/SeedPhrase/ConfirmSeedPopup";
import { DecryptPrompt } from "../components/SeedPhrase/DecryptPrompt";
import { SeedImportPopup } from "../components/SeedPhrase/SeedImportPopup";
import { ResetPasswordWithSeed } from "../components/SeedPhrase/ResetPasswordWithSeed";
import { useUser } from "../context/UserContext";
import { shouldShowBackup } from "../utils/walletBackup";
import { getIdentifier } from "../utils/walletIdentifiers";
import { decryptMnemonic } from "../utils/walletDecrypt";
import { handleWalletImport } from "../utils/walletImport";
import { showInitialPrompt } from "../components/Wallet/InitialPrompt";

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
    address,
    addressweb,
  } = useWallet();

  const [showBackup, setShowBackup] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [verifyIndices, setVerifyIndices] = useState<number[] | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const [showResetFlow, setShowResetFlow] = useState(false);
  const { userData, isBrowser } = useUser();

  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.telegramId);

  useEffect(() => {
    if (!hasWallet && (userData?.telegramId || isBrowser)) {
      showInitialPrompt({
        onCreate: createWalletFlow,
        onImport: () => setShowImport(true),
      });
    }
  }, [hasWallet, isBrowser, userData?.telegramId]);

  useEffect(() => {
    if (!identifier) return;

    const allKeys = Object.keys(localStorage);
    const otherWalletKey = allKeys.find(
      (key) => key.startsWith("encryptedSeed-") && key !== `encryptedSeed-${identifier}`
    );

    if (otherWalletKey) {
      Swal.fire({
        icon: "error",
        title: "Access Denied",
        html: `<p style="font-size:14px;">You are not allowed to access this app using multiple accounts on the same device.</p>`,
        allowOutsideClick: false,
        allowEscapeKey: false,
      });
    }
  }, [identifier]);

  useEffect(() => {
    const checkBackup = () => {
      if (shouldShowBackup(identifier, hasWallet)) {
        setShowBackup(true);
      } else {
        setShowBackup(false);
      }
    };

    checkBackup();
    window.addEventListener("focus", checkBackup);
    window.addEventListener("wallet-imported", checkBackup);
    return () => {
    window.removeEventListener("focus", checkBackup);
    window.removeEventListener("wallet-imported", checkBackup); 
  };
  }, [identifier, hasWallet]);

  useEffect(() => {
    if (showBackup && decryptedPassword && !mnemonic) {
      setPassword(decryptedPassword);
      handleDecrypt();
    }
  }, [showBackup, decryptedPassword, mnemonic]);

  const handleDecrypt = async () => {
    if (!identifier) return;

    const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
    if (!encrypted) {
      Swal.fire("Error", "No encrypted seed found.", "error");
      return;
    }

    const phrase = decryptMnemonic(encrypted, password);
    if (!phrase) {
      setPasswordError("❌ Invalid password. Please try again.");
      return;
    }

    setMnemonic(phrase);
    setPassword("");
    setPasswordError("");
  };

  const confirmBackup = () => {
    const indices = new Set<number>();
    while (indices.size < 4) indices.add(Math.floor(Math.random() * 12));
    setVerifyIndices(Array.from(indices));
  };

  const handleImport = async (importedMnemonic: string) => {
    setShowImport(false);
    handleWalletImport({
      importedMnemonic,
      isBrowser,
      userData,
      address,
      addressweb,
      provider,
      restoreWalletFromEncryptedSeed,
      setSigner,
      setAddress,
      setHasWallet,
      setDecryptedPassword,
      onDone: () => Swal.fire("Success", "Wallet restored successfully.", "success"),
      onError: (msg) => Swal.fire("Error", msg, "error"),
    });
  };

  if (verifyIndices && mnemonic) {
    return (
      <ConfirmSeedPopup
        words={mnemonic.split(" ")}
        indices={verifyIndices}
        onSuccess={() => {
          if (identifier) localStorage.setItem(`seedBackupDone-${identifier}`, "true");
          setShowBackup(false);
          setVerifyIndices(null);
          Swal.fire("✅ Success", "Backup complete", "success");
        }}
        onFailure={() => {
          Swal.fire("❌ Failed", "Verification failed. Try again.", "error");
          setVerifyIndices(null);
        }}
      />
    );
  }

  if (showBackup && !mnemonic) {
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
              Swal.fire("Success", "You can now unlock your wallet.", "success");
            }}
            onCancel={() => {
              setShowResetFlow(false);
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
          showInitialPrompt({
            onCreate: createWalletFlow,
            onImport: () => setShowImport(true),
          });
        }}
      />
    );
  }

  return null;
}
