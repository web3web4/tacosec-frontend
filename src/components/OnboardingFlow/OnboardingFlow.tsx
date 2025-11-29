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
  viewSeedOnly?: boolean; // If true, show seed phrase in view-only mode (no backup confirmation)
}

export function OnboardingFlow({ onComplete, initialStep = 'welcome', initialData = {}, isDecryptOnly = false, viewSeedOnly = false }: OnboardingFlowProps) {
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
      const identifier = isBrowser ? address || addressweb : userData?.user?.telegramId;
      if (!identifier) {
        MetroSwal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to identify wallet'
        });
        return;
      }

      // Encrypt seed phrase with new password
      const { encryptSeed } = await import('@/utils');
      const encrypted = encryptSeed(seedPhrase.trim(), password);
      
      // Save encrypted seed
      localStorage.setItem(`encryptedSeed-${identifier}`, encrypted);
      localStorage.setItem(`seedBackupDone-${identifier}`, "true");
      
      // Save password preference
      localStorage.setItem("savePasswordInBackend", saveInBackend.toString());

      // If save in backend is enabled, store on server
      if (saveInBackend) {
        try {
          const { ethers } = await import('ethers');
          const wallet = ethers.Wallet.fromMnemonic(seedPhrase.trim());
          const { storagePublicKeyAndPassword } = await import('@/apiService');
          await storagePublicKeyAndPassword(
            { publicKey: wallet.address, secret: password },
            initDataRaw || ""
          );
        } catch (err) {
          console.error('Failed to save password on server:', err);
        }
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
  }, [navigateToStep, isBrowser, address, addressweb, userData?.user?.telegramId, initDataRaw]);

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