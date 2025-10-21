import React, { useState } from 'react';
import { MdLock, MdLockOpen, MdArrowBack, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { getIdentifier, decryptMnemonic } from '@/utils';
import { useUser } from '@/context';
import { useWallet } from '@/wallet/walletContext';

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
  
  const { userData, isBrowser } = useUser();
  const { address, addressweb } = useWallet();
  
  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);
  
  // Check if user can restore from server
  const canRestoreFromServer = localStorage.getItem('savePasswordInBackend') === 'true';

  const handleDecrypt = async () => {
    if (!identifier) {
      setError('Unable to identify wallet');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
      if (!encrypted) {
        setError('No encrypted seed found');
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
    // This would implement server-side password restoration
    // For now, we'll show a placeholder message
    setError('Server restoration feature coming soon');
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
            className={`onboarding-input ${error ? 'error' : ''}`}
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
                <button 
                  className="onboarding-btn secondary"
                  onClick={handleRestoreFromServer}
                  style={{ width: '100%' }}
                >
                  Restore from Server
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