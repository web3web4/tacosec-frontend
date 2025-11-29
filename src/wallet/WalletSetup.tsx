import { shouldShowBackup, getIdentifier, MetroSwal, getEncryptedSeed } from "@/utils";
import { OnboardingFlow } from "@/components";
import { useEffect, useState } from "react";
import { useWallet } from "./walletContext";
import { useUser } from "@/context";


export default function WalletSetup() {
  const {
    hasWallet,
    address,
    addressweb,
    signer,
  } = useWallet();
  const [showBackup, setShowBackup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDecrypt, setShowDecrypt] = useState(false);
  const { userData, isBrowser } = useUser();

  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);

  // Check if we need to show decrypt flow (wallet exists but not unlocked)
  useEffect(() => {
    if (!identifier) return;
    
    const encrypted = getEncryptedSeed(identifier);
    const recentWalletCreation = sessionStorage.getItem('recentWalletCreation');
    
    // Don't show decrypt if backup flow is already showing
    if (showBackup) {
      setShowDecrypt(false);
      return;
    }
    
    // Show decrypt if:
    // 1. Encrypted seed exists (has wallet)
    // 2. No signer (wallet not unlocked)
    // 3. Not a recent wallet creation (to avoid showing after onboarding)
    // 4. User is authenticated
    if (encrypted && !signer && !recentWalletCreation && (userData?.user?.telegramId || isBrowser)) {
      setShowDecrypt(true);
    } else {
      setShowDecrypt(false);
    }
  }, [identifier, signer, hasWallet, isBrowser, userData?.user?.telegramId, showBackup]);
      
  useEffect(() => {
    // Show onboarding only if:
    // 1. No wallet exists (!hasWallet)
    // 2. User is authenticated (telegramId or browser)
    // Don't show if decrypt flow is active
    if (!hasWallet && !showDecrypt && (userData?.user?.telegramId || isBrowser)) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [hasWallet, isBrowser, userData?.user?.telegramId, showDecrypt]);

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
      // Don't show backup popups if user is in onboarding flow or decrypt flow
      if (showOnboarding || showDecrypt) {
        setShowBackup(false);
        return;
      }
      
      // Only show backup if wallet is unlocked (has signer)
      if (signer && shouldShowBackup(identifier, hasWallet)) {
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
  }, [identifier, hasWallet, showOnboarding, showDecrypt, signer]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Prevent backup popups from showing immediately after onboarding
    setShowBackup(false);
  };

  const handleBackupComplete = () => {
    setShowBackup(false);
    MetroSwal.fire({
      icon: 'success',
      title: '✅ Success',
      text: 'Backup complete'
    });
  };

  const handleDecryptComplete = () => {
    setShowDecrypt(false);
    // After successful decryption, wallet will be unlocked
    // The backup flow will automatically show if seedBackupDone is false
    // No need to reload - the state will update naturally
  };

  // Show decrypt flow (wallet exists but not unlocked)
  if (showDecrypt) {
    return (
      <OnboardingFlow
        initialStep="decrypt"
        onComplete={handleDecryptComplete}
        isDecryptOnly={false} // Always allow backup flow check after decrypt
      />
    );
  }

  // Show backup flow using new OnboardingFlow screens (only if wallet is unlocked)
  if (showBackup && signer) {
    return (
      <OnboardingFlow
        initialStep="decrypt"
        onComplete={handleBackupComplete}
      />
    );
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
