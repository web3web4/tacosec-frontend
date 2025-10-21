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
}

export function OnboardingFlow({ onComplete, initialStep = 'welcome', initialData = {} }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(initialStep);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(initialData);
  const [stepHistory, setStepHistory] = useState<OnboardingStep[]>([initialStep]);
  
  const { userData, isBrowser } = useUser();
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

  const displayName = userData?.user?.firstName && userData?.user?.lastName
    ? `${userData?.user?.firstName} ${userData?.user?.lastName}`
    : userData?.user?.username
    ? userData.user.username
    : 'Friend';

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
  }, [onboardingData, createWalletWithPassword, navigateToStep, isBrowser, userData, address, addressweb, provider, restoreWalletFromEncryptedSeed, setSigner, setAddress, setHasWallet, setDecryptedPassword, onComplete]);

  const handleImportWallet = useCallback((seedPhrase: string) => {
    setOnboardingData(prev => ({ ...prev, seedPhrase }));
    navigateToStep('password');
  }, [navigateToStep]);

  const handleSeedBackupConfirm = useCallback((mnemonic: string) => {
    // Generate random indices for seed phrase verification
    const verifyIndices = Array.from({ length: 3 }, () => Math.floor(Math.random() * 12));
    setOnboardingData(prev => ({ ...prev, verifyIndices }));
    navigateToStep('seed-confirm');
  }, [navigateToStep]);

  const handleSeedConfirmSuccess = useCallback(() => {
    // Mark seed backup as completed to prevent backup flow from triggering
    const identifier = isBrowser ? address || addressweb : userData?.user?.telegramId;
    
    if (identifier) {
      localStorage.setItem(`seedBackupDone-${identifier}`, "true");
    }
    
    onComplete();
  }, [onComplete, isBrowser, address, addressweb, userData?.user?.telegramId]);

  const handleDecryptSuccess = useCallback((seedPhrase: string) => {
    setOnboardingData(prev => ({ ...prev, seedPhrase }));
    navigateToStep('seed-backup');
  }, [navigateToStep]);

  const handleResetPasswordSuccess = useCallback((seedPhrase: string, password: string, saveInBackend: boolean) => {
    setOnboardingData(prev => ({ ...prev, seedPhrase, password, saveInBackend }));
    navigateToStep('seed-backup');
  }, [navigateToStep]);

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