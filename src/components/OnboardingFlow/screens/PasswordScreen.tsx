import React, { useState } from 'react';
import { MdLock, MdArrowBack } from 'react-icons/md';

interface PasswordScreenProps {
  onPasswordSet: (password: string, savePassword: boolean) => void;
  onBack?: () => void;
  isImporting?: boolean;
}

export function PasswordScreen({ onPasswordSet, onBack, isImporting = false }: PasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savePassword, setSavePassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});

  // Check if savePasswordInBackend exists in localStorage
  const showSaveOption = localStorage.getItem("savePasswordInBackend") === null;

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
            className={`onboarding-input ${errors.password ? 'error' : ''}`}
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
            className={`onboarding-input ${errors.confirm ? 'error' : ''}`}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {errors.confirm && (
            <div className="onboarding-error">{errors.confirm}</div>
          )}
        </div>
        
        {showSaveOption && (
          <div className="onboarding-checkbox">
            <input
              type="checkbox"
              id="save-password"
              checked={savePassword}
              onChange={(e) => setSavePassword(e.target.checked)}
            />
            <label htmlFor="save-password">
              Save wallet password on our servers (encrypted)
            </label>
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
          onClick={handleSubmit}
          disabled={!password || !confirmPassword}
        >
          {isImporting ? 'Import Wallet' : 'Create Wallet'}
        </button>
      </div>
    </div>
  );
}