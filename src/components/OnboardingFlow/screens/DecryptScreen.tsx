import React, { useState } from 'react';
import { MdLock, MdLockOpen, MdArrowBack, MdExpandMore, MdExpandLess, MdRestorePage } from 'react-icons/md';
import { getIdentifier, decryptMnemonic, MetroSwal, getSavedPasswordPreference, getEncryptedSeed } from '@/utils';
import { useUser } from '@/context';
import { useWallet } from '@/wallet/walletContext';
import { getPublicAddresses } from '@/services';
import CryptoJS from 'crypto-js';
import { config } from '@/utils/config';

interface DecryptScreenProps {
  onSuccess: (mnemonic: string) => void;
  onForgotPassword: () => void;
  onBack?: () => void;
}

export function DecryptScreen({ onSuccess, onForgotPassword, onBack }: DecryptScreenProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');

  const { userData, isBrowser, initDataRaw } = useUser();
  const { address, addressweb } = useWallet();

  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);

  // Check if user can restore from server
  const canRestoreFromServer = getSavedPasswordPreference();

  // Helper function to fetch latest secret and publicKey from server
  const fetchLatestSecret = async (): Promise<{ secret: string; publicKey: string } | null> => {
    try {
      const response = await getPublicAddresses(initDataRaw);

      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Filter elements containing secret
        const withSecrets = response.data.filter(
          (item: { secret?: string; publicKey?: string }) => !!item.secret && !!item.publicKey
        );

        if (withSecrets.length > 0) {
          // Sort them by most recent
          const sortedAddresses = withSecrets.sort(
            (a: { createdAt: string }, b: { createdAt: string }) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          const latestAddress = sortedAddresses[0];
          return {
            secret: latestAddress.secret!,
            publicKey: latestAddress.publicKey!
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch latest secret:', error);
      return null;
    }
  };

  const handleDecrypt = async () => {
    if (!identifier) {
      setError('Unable to identify wallet');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const encrypted = getEncryptedSeed(identifier || "");
      if (!encrypted || encrypted === null) {
        setError('We couldn\'t find a saved seed on this device.');
        setIsLoading(false);
        return;
      }

      const phrase = decryptMnemonic(encrypted, password);
      if (!phrase) {
        setError('❌ Invalid password. Please try again.');
        setIsLoading(false);
        return;
      }

      onSuccess(phrase);
    } catch (error) {
      setError('An error occurred while decrypting your wallet');
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && password && !isLoading) {
      handleDecrypt();
    }
  };

  const handleRestoreFromServer = async () => {
    try {
      setIsRestoring(true);
      setRestoreError('');
      setError('');

      const latestData = await fetchLatestSecret();

      if (latestData && latestData.secret && latestData.publicKey) {
        try {
          // Decrypt the password using the same key used for encryption (publicKey + SALT)
          const SALT = config.TG_SECRET_SALT || "default_salt";
          const decryptionKey = latestData.publicKey + "|" + SALT;

          const decryptedBytes = CryptoJS.AES.decrypt(latestData.secret, decryptionKey);
          const decryptedPassword = decryptedBytes.toString(CryptoJS.enc.Utf8);

          if (!decryptedPassword) {
            setRestoreError('Failed to decrypt password. The encryption key may be incorrect.');
            return;
          }

          setPassword(decryptedPassword);
          MetroSwal.fire({
            icon: 'success',
            title: '✅ Success',
            text: 'Password restored successfully'
          });
        } catch (decryptError) {
          console.error('Failed to decrypt password:', decryptError);
          setRestoreError('Failed to decrypt password. Please try resetting your password.');
        }
      } else {
        setRestoreError('No password found on server');
      }
    } catch (error) {
      setRestoreError(error instanceof Error ? error.message : 'Failed to restore password');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdLock />
          Decrypt Your Wallet
        </h1>
        <p>
          Enter your password to unlock your wallet and continue.
        </p>
      </div>

      <div className="onboarding-content">
        <div>
          <label className="onboarding-label">Password</label>
          <input
            type="password"
            className={`onboarding-input ${error ? 'onboarding-input--error ' : ''}`}
            placeholder="Your encryption password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            autoFocus
            disabled={isLoading}
          />

          {error && (
            <div className="onboarding-error">{error}</div>
          )}
        </div>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <button
            onClick={onForgotPassword}
            style={{
              background: 'none',
              border: 'none',
              color: '#4CAF50',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Forgot password?
          </button>
        </div>

        {canRestoreFromServer && (
          <div style={{ marginTop: '20px' }}>
            <div
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: '14px',
                gap: '4px'
              }}
            >
              {showMoreOptions ? <MdExpandLess /> : <MdExpandMore />}
              More options
            </div>

            {showMoreOptions && (
              <div style={{
                marginTop: '15px',
                padding: '16px',
                border: '1px solid #eee',
                borderRadius: '8px',
                background: '#f9f9f9'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#666',
                  margin: '0 0 12px 0'
                }}>
                  You can try to restore your password from our servers:
                </p>
                {restoreError && (
                  <div style={{
                    color: '#c62828',
                    fontSize: '12px',
                    marginBottom: '12px',
                    textAlign: 'center'
                  }}>
                    {restoreError}
                  </div>
                )}
                <button
                  className="onboarding-btn secondary"
                  onClick={handleRestoreFromServer}
                  disabled={isRestoring}
                  style={{ width: '100%' }}
                >
                  {isRestoring ? (
                    'Restoring...'
                  ) : (
                    <>
                      <MdRestorePage style={{ marginRight: '4px' }} />
                      Restore from Server
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={`onboarding-actions ${onBack ? 'with-back' : 'single'}`}>
        {onBack && (
          <button className="onboarding-btn back" onClick={onBack}>
            <MdArrowBack />
            Back
          </button>
        )}

        <button
          className="onboarding-btn primary"
          onClick={handleDecrypt}
          disabled={!password || isLoading}
        >
          {isLoading ? (
            'Unlocking...'
          ) : (
            <>
              <MdLockOpen />
              Unlock Wallet
            </>
          )}
        </button>
      </div>
    </div>
  );
}