import React, { useState } from 'react';
import { MdLock, MdArrowBack, MdWarning } from 'react-icons/md';

interface PasswordScreenProps {
  onPasswordSet: (password: string, savePassword: boolean) => void;
  onBack?: () => void;
  isImporting?: boolean;
}

export function PasswordScreen({ onPasswordSet, onBack, isImporting = false }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const previouslySaved = localStorage.getItem('savePasswordInBackend') === 'true';
  // Initialize savePassword based on previous user preference
  const [savePassword, setSavePassword] = useState(previouslySaved);
  // If user has previously saved their password, show the option to highlight the security notes
  const [showSaveOption, setShowSaveOption] = useState(previouslySaved);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  const validateForm = () => {
    const newErrors: { password?: string; confirm?: string } = {};
    
    if (!password) {
      newErrors.password = 'Please enter a password';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirm = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirm = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onPasswordSet(password, savePassword);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdLock />
          Set Password
        </h1>
        <p>
          {isImporting 
            ? 'Set a password to encrypt your imported wallet'
            : 'Create a secure password to encrypt your new wallet'
          }
        </p>
      </div>
      
      <div className="onboarding-content">
        <div>
          <label className="onboarding-label">Password</label>
          <input
            type="password"
            className={`onboarding-input ${errors.password ? 'onboarding-input--error' : ''}`}
            placeholder="Enter a secure password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
          />
          {errors.password && (
            <div className="onboarding-error">{errors.password}</div>
          )}
        </div>
        
        <div>
          <label className="onboarding-label">Confirm Password</label>
          <input
            type="password"
            className={`onboarding-input ${errors.confirm ? 'onboarding-input--error' : ''}`}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {errors.confirm && (
            <div className="onboarding-error">{errors.confirm}</div>
          )}
        </div>

        <div>
            <button
              type="button"
              onClick={() => setShowSaveOption(!showSaveOption)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(149, 255, 93, 0.7)',
                fontSize: '0.9rem',
                cursor: 'pointer',
                padding: '0.5rem 0',
                textDecoration: 'underline',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              <span>{showSaveOption ? '▼' : '▶'}</span>
              Afraid of forgetting your password?
            </button>

            {showSaveOption && (
              <div
                style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgba(149, 255, 93, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(149, 255, 93, 0.2)',
                }}
              >
                <p
                  style={{
                    margin: '0 0 1rem 0',
                    fontSize: '0.95rem',
                    lineHeight: '1.5',
                    color: '#95ff5d',
                  }}
                >
                  Save your password with us (encrypted) in case you forget it.
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                  }}
                >
                  <MdWarning
                    style={{
                      color: '#ff9800',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      color: '#ffb74d',
                    }}
                  >
                    <strong style={{ color: '#ff9800' }}>Security Note:</strong>
                    <ul
                      style={{
                        margin: '0.25rem 0 0 0',
                        paddingLeft: '1.25rem',
                      }}
                    >
                      <li>
                        Your wallet{' '}
                        <strong>seed phrase never leaves your device</strong>. 
                      </li>
                      <li>
                        You'll still need to <strong>back up your seed phrase</strong> to recover your wallet on another device.
                      </li>
                      <li>
                        Only the password will be stored (encrypted) — <strong>NOT the seed phrase</strong>
                      </li>
                      <li>Not recommended for high-value wallets</li>
                      <li>Use only if you prefer convenience over security</li>
                    </ul>
                  </div>
                </div>

                <div className="onboarding-checkbox">
                  <input
                    type="checkbox"
                    id="save-password"
                    checked={savePassword}
                    onChange={(e) => setSavePassword(e.target.checked)}
                  />
                  <label htmlFor="save-password">
                    Yes, save my password in the cloud (encrypted)
                  </label>
                </div>
              </div>
            )}
          </div>
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
          onClick={handleSubmit}
          disabled={!password || !confirmPassword}
        >
          {isImporting ? 'Import Wallet' : 'Create Wallet'}
        </button>
      </div>
    </div>
  );
}