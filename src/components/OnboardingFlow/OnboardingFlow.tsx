import React, { useState, useCallback } from 'react';
import { useWallet } from '@/wallet/walletContext';
import { useUser } from '@/context';
import { handleWalletImport, MetroSwal, createAppError, handleSilentError } from '@/utils';
import {
  WelcomeScreen,
  PasswordScreen,
  ImportWalletScreen,
  SeedBackupScreen,
  SeedConfirmScreen,
  DecryptScreen,
  ResetPasswordScreen
} from './screens';
import './OnboardingFlow.css';
import { storagePublicKeyAndPassword, loginUserWeb } from '@/services';
import CryptoJS from 'crypto-js';
import { config } from '@/utils/config';

export type OnboardingStep =
  | 'welcome'
  | 'password'
  | 'import-wallet'
  | 'seed-backup'
  | 'seed-confirm'
  | 'decrypt'
  | 'reset-password';

export interface OnboardingData {
  choice?: 'create' | 'import';
  password?: string;
  saveInBackend?: boolean;
  seedPhrase?: string;
  verifyIndices?: number[];
}

interface OnboardingFlowProps {
  onComplete: () => void;
  initialStep?: OnboardingStep;
  initialData?: OnboardingData;
  isDecryptOnly?: boolean; // If true, unlock wallet after decrypt without showing backup
  viewSeedOnly?: boolean;// If true, show seed phrase in view-only mode (no backup confirmation)
  viewBack?: boolean;
}

export function OnboardingFlow({ onComplete, initialStep = 'welcome', initialData = {}, isDecryptOnly = false, viewSeedOnly = false, viewBack = true }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialData);
  const [stepHistory, setStepHistory] = useState<OnboardingStep[]>([initialStep]);

  const { userData, isBrowser, initDataRaw } = useUser();
  const {
    createWalletWithPassword,
    restoreWalletFromEncryptedSeed,
    setSigner,
    setAddress,
    setHasWallet,
    setDecryptedPassword,
    address,
    addressweb,
    provider
  } = useWallet();


  const navigateToStep = useCallback((step: OnboardingStep, data?: Partial<OnboardingData>) => {
    setCurrentStep(step);
    setStepHistory(prev => [...prev, step]);
    if (data) {
      setOnboardingData(prev => ({ ...prev, ...data }));
    }
  }, []);

  const goBack = useCallback(() => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      const previousStep = newHistory[newHistory.length - 1];
      setStepHistory(newHistory);
      setCurrentStep(previousStep);
    }
  }, [stepHistory]);

  const canGoBack = stepHistory.length > 1;

  const handleWelcomeChoice = useCallback((choice: 'create' | 'import') => {
    setOnboardingData(prev => ({ ...prev, choice }));
    if (choice === 'create') {
      navigateToStep('password');
    } else {
      navigateToStep('import-wallet');
    }
  }, [navigateToStep]);

  const handlePasswordSet = useCallback(async (password: string, saveInBackend: boolean) => {
    try {
      setOnboardingData(prev => ({ ...prev, password, saveInBackend }));

      if (onboardingData.choice === 'create') {
        // Create new wallet with backup handled in wizard
        const result = await createWalletWithPassword(password, saveInBackend, true);
        if (result) {
          // Navigate to seed backup screen within the wizard
          setOnboardingData(prev => ({ ...prev, seedPhrase: result.mnemonic }));
          navigateToStep('seed-backup');
        }
      } else if (onboardingData.choice === 'import' && onboardingData.seedPhrase) {
        // Import existing wallet
        await handleWalletImport({
          importedMnemonic: onboardingData.seedPhrase,
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
          providedPassword: password,
          providedSavePassword: saveInBackend,
          initDataRaw,
          onDone: () => {
            MetroSwal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Wallet imported successfully.'
            });
            onComplete();
          },
          onError: (msg) => {
            MetroSwal.fire({
              icon: 'error',
              title: 'Error',
              text: msg
            });
          },
        });
      }
    } catch (error) {
      const appError = createAppError(error, 'unknown', 'Wallet operation failed');
      handleSilentError(appError, 'OnboardingFlow wallet operation');
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: appError.message || 'An error occurred. Please try again.'
      });
    }
  }, [onboardingData, createWalletWithPassword, navigateToStep, isBrowser, userData, address, addressweb, provider, restoreWalletFromEncryptedSeed, setSigner, setAddress, setHasWallet, setDecryptedPassword, onComplete, initDataRaw]);

  const handleImportWallet = useCallback((seedPhrase: string) => {
    setOnboardingData(prev => ({ ...prev, seedPhrase }));
    navigateToStep('password');
  }, [navigateToStep]);

  const handleSeedBackupConfirm = useCallback((mnemonic: string) => {
    // Generate random unique indices for seed phrase verification (no duplicates)
    const indices = new Set<number>();
    while (indices.size < 3) {
      indices.add(Math.floor(Math.random() * 12));
    }
    const verifyIndices = Array.from(indices);
    setOnboardingData(prev => ({ ...prev, verifyIndices }));
    navigateToStep('seed-confirm');
  }, [navigateToStep]);

  const handleSeedConfirmSuccess = useCallback(() => {
    // Mark seed backup as completed to prevent backup flow from triggering
    const identifier = isBrowser ? address || addressweb : userData?.user?.telegramId;

    if (identifier) {
      localStorage.setItem(`seedBackupDone-${identifier}`, "true");
    }

    // Complete the flow - if this was decrypt flow, wallet is already unlocked
    onComplete();
  }, [onComplete, isBrowser, address, addressweb, userData?.user?.telegramId]);

  const handleDecryptSuccess = useCallback(async (seedPhrase: string) => {
    try {
      const { ethers } = await import('ethers');

      // Restore wallet from seed phrase and unlock it
      const restoredWallet = ethers.Wallet.fromMnemonic(seedPhrase);
      const walletSigner = restoredWallet.connect(provider);

      setSigner(walletSigner);
      setAddress(restoredWallet.address);
      if (isBrowser) {
        if (!localStorage.getItem('publicAddress')) {
          localStorage.setItem('publicAddress', restoredWallet.address);
        }
      }
      setHasWallet(true);
      sessionStorage.removeItem('recentWalletCreation');

      // Check if backup is needed
      const identifier = isBrowser ? restoredWallet.address : userData?.user?.telegramId;
      const seedBackupDone = identifier ? localStorage.getItem(`seedBackupDone-${identifier}`) === "true" : true;

      // If view-only mode (for Settings)
      if (viewSeedOnly) {
        setOnboardingData(prev => ({ ...prev, seedPhrase }));
        navigateToStep('seed-backup');
        return;
      }

      // If backup is needed (seedBackupDone = false), continue to backup flow
      if (!seedBackupDone) {
        setOnboardingData(prev => ({ ...prev, seedPhrase }));
        navigateToStep('seed-backup');
        return;
      }

      // If backup is done, complete immediately (wallet is unlocked)
      MetroSwal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Wallet unlocked successfully'
      });
      onComplete();
    } catch (error) {
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to restore wallet from seed phrase'
      });
    }
  }, [navigateToStep, viewSeedOnly, isBrowser, provider, setSigner, setAddress, setHasWallet, onComplete, userData?.user?.telegramId]);

  const handleResetPasswordSuccess = useCallback(async (seedPhrase: string, password: string, saveInBackend: boolean) => {
    try {
      const trimmedSeed = seedPhrase.trim();

      // Derive wallet from provided seed phrase (may be a different wallet than the old one)
      const { ethers } = await import('ethers');
      const wallet = ethers.Wallet.fromMnemonic(trimmedSeed);

      // Old identifier (for cleanup) and new identifier (for storage)
      const oldIdentifier = isBrowser ? address || addressweb : userData?.user?.telegramId;
      const newIdentifier = isBrowser ? wallet.address : userData?.user?.telegramId;

      if (!newIdentifier) {
        MetroSwal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to identify wallet'
        });
        return;
      }

      // Encrypt seed phrase with new password
      const { encryptSeed } = await import('@/utils');
      const encrypted = encryptSeed(trimmedSeed, password);

      // Save encrypted seed and backup status using the *new* identifier
      localStorage.setItem(`encryptedSeed-${newIdentifier}`, encrypted);
      localStorage.setItem(`seedBackupDone-${newIdentifier}`, "true");

      // If identifier changed (e.g. importing a different wallet on web), clean up old keys
      if (oldIdentifier && oldIdentifier !== newIdentifier) {
        localStorage.removeItem(`encryptedSeed-${oldIdentifier}`);
        localStorage.removeItem(`seedBackupDone-${oldIdentifier}`);
      }

      // Save password preference
      localStorage.setItem("savePasswordInBackend", saveInBackend.toString());

      // For browser users, keep publicAddress in sync with the newly imported wallet
      if (isBrowser) {
        localStorage.setItem('publicAddress', wallet.address);
      }

      // Update in-memory wallet state so UI reflects the new wallet immediately
      const walletSigner = wallet.connect(provider);
      setSigner(walletSigner);
      setAddress(wallet.address);
      setHasWallet(true);

      // If save in backend is enabled, store on server with the new public key
      if (saveInBackend) {
        // Encrypt password using public key + SALT for secure transmission
        const SALT = config.TG_SECRET_SALT || "default_salt";
        const encryptionKey = wallet.address + "|" + SALT;
        const encryptedPassword = CryptoJS.AES.encrypt(password, encryptionKey).toString();
        try {
          await storagePublicKeyAndPassword(
            { publicKey: wallet.address, secret: encryptedPassword },
            initDataRaw || ""
          );
        } catch (err) {
          console.error('Failed to save password on server:', err);
        }
      }

      try {
        // For web users: clear old auth cookies/tokens and log in again with the new wallet
        if (isBrowser) {
          try {
            // loginUserWeb will internally set new tokens in cookies
            const message = `Login to Taco App: ${Date.now()}`;
            const loginSignature = await wallet.signMessage(message);
            await loginUserWeb(wallet.address, loginSignature);
          } catch (err) {
            console.error('Failed to refresh web login after password reset:', err);
          }
        }

        // Generate signature for wallet import verification
        const message = `Import wallet to TacoSec App: ${wallet.address}:${Date.now()}`;
        const signature = await wallet.signMessage(message);

        // Call storagePublicKeyAndPassword with public key and signature
        // This is for cross-platform wallet import (web to Telegram or vice versa)
        // For web users, authentication is already set up via loginUserWeb
        // For Telegram users, initDataRaw is passed for authentication
        await storagePublicKeyAndPassword(
          { publicKey: wallet.address, signature },
          initDataRaw || ""
        );
      } catch (err) {
        // Silently handle errors - don't block the import process if storage fails
        handleSilentError(err, 'storagePublicKeyAndPassword on import');
      }

      // Update onboarding data and navigate to seed backup
      setOnboardingData(prev => ({ ...prev, seedPhrase, password, saveInBackend }));
      navigateToStep('seed-backup');
    } catch (error) {
      const appError = createAppError(error, 'unknown', 'Failed to reset password');
      handleSilentError(appError, 'OnboardingFlow reset password');
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: appError.message || 'Failed to reset password. Please try again.'
      });
    }
  }, [navigateToStep, isBrowser, address, addressweb, userData?.user?.telegramId, initDataRaw, provider, setSigner, setAddress, setHasWallet]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <WelcomeScreen
            onChoice={handleWelcomeChoice}
          />
        );

      case 'password':
        return (
          <PasswordScreen
            isImporting={onboardingData.choice === 'import'}
            onPasswordSet={handlePasswordSet}
            onBack={canGoBack ? goBack : undefined}
          />
        );

      case 'import-wallet':
        return (
          <ImportWalletScreen
            onImport={handleImportWallet}
            onBack={canGoBack ? goBack : undefined}
          />
        );

      case 'seed-backup':
        return (
          <SeedBackupScreen
            mnemonic={onboardingData.seedPhrase || ''}
            onConfirm={handleSeedBackupConfirm}
            onBack={canGoBack ? goBack : undefined}
            viewOnly={viewSeedOnly}
            onClose={onComplete}
            viewBack={viewBack}
          />
        );

      case 'seed-confirm':
        return (
          <SeedConfirmScreen
            words={(onboardingData.seedPhrase || '').split(' ')}
            indices={onboardingData.verifyIndices || []}
            onSuccess={handleSeedConfirmSuccess}
            onBack={canGoBack ? goBack : undefined}
          />
        );

      case 'decrypt':
        return (
          <DecryptScreen
            onSuccess={handleDecryptSuccess}
            onForgotPassword={() => navigateToStep('reset-password')}
            onBack={canGoBack ? goBack : undefined}
          />
        );

      case 'reset-password':
        return (
          <ResetPasswordScreen
            onSuccess={handleResetPasswordSuccess}
            onBack={canGoBack ? goBack : undefined}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-container">
        {renderCurrentStep()}
      </div>
    </div>
  );
}

export default OnboardingFlow;