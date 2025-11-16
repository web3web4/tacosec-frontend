import { ConfirmSeedPopup, DecryptPrompt, SeedImportPopup, ResetPasswordWithSeed, SeedBackupPopup } from "@/components";
import { shouldShowBackup, getIdentifier, decryptMnemonic, handleWalletImport, MetroSwal } from "@/utils";
import { OnboardingFlow } from "@/components/OnboardingFlow/OnboardingFlow";
import { useEffect, useState } from "react";
import { useWallet } from "./walletContext";
import { useUser } from "@/context";

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
    signer,
  } = useWallet();
  const [showBackup, setShowBackup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>("");
  const [verifyIndices, setVerifyIndices] = useState<number[] | null>(null);
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const [showResetFlow, setShowResetFlow] = useState(false);
  const { userData, isBrowser } = useUser();

  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);

  const displayName =
  userData?.user?.firstName && userData?.user?.lastName
    ? `${userData.user.firstName} ${userData.user.lastName}`
    : userData?.user?.username
    ? userData.user.username
    : "Friend";

      
  useEffect(() => {
    // Show onboarding only if:
    // 1. No wallet exists (!hasWallet)
    // 2. Wallet is not unlocked (!signer)
    // 3. User is authenticated (telegramId or browser)
    // Hide onboarding if wallet exists and is unlocked
    if (!hasWallet && (userData?.user?.telegramId || isBrowser)) {
      setShowOnboarding(true);
    } else if (hasWallet || signer) {
      // If wallet exists or is unlocked, hide onboarding
      setShowOnboarding(false);
    }
  }, [hasWallet, signer, isBrowser, userData?.user?.telegramId]);

  useEffect(() => {
    if (!identifier) return;

    const allKeys = Object.keys(localStorage);
    const otherWalletKey = allKeys.find(
      (key) => key.startsWith("encryptedSeed-") && key !== `encryptedSeed-${identifier}`
    );

    if (otherWalletKey) {
      MetroSwal.fire({
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
      // Don't show backup popups if user is in onboarding flow
      if (showOnboarding) {
        setShowBackup(false);
        return;
      }
      
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
  }, [identifier, hasWallet, showOnboarding]);

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
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No encrypted seed found.'
      });
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

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Prevent backup popups from showing immediately after onboarding
    setShowBackup(false);
  };

  const handleImport = async (importedMnemonic: string) => {
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
      onDone: () => MetroSwal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Wallet restored successfully.'
      }),
      onError: (msg) => MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: msg
      }),
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
          MetroSwal.fire({
            icon: 'success',
            title: '✅ Success',
            text: 'Backup complete'
          });
        }}
        onFailure={() => {
          MetroSwal.fire({
            icon: 'error',
            title: '❌ Failed',
            text: 'Verification failed. Try again.'
          });
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
              MetroSwal.fire({
                icon: 'success',
                title: 'Success',
                text: 'You can now unlock your wallet.'
              });
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

  // Show onboarding flow for new users
  if (showOnboarding) {
    return (
      <OnboardingFlow
        initialStep="welcome"
        onComplete={handleOnboardingComplete}
      />
    );
  }

  return null;
}
