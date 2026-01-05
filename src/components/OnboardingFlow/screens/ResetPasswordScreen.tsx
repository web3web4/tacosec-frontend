import React, { useState } from 'react';
import { MdLockReset, MdArrowBack, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { ethers } from 'ethers';

interface ResetPasswordScreenProps {
  onSuccess: (seedPhrase: string, newPassword: string, saveInBackend: boolean) => void;
  onBack?: () => void;
}

export function ResetPasswordScreen({ onSuccess, onBack }: ResetPasswordScreenProps) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveInBackend, setSaveInBackend] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    seedPhrase?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Check if backend save option should be shown
  const showSaveOption = localStorage.getItem('savePasswordInBackend') !== null;

  const validateSeedPhrase = (phrase: string): boolean => {
    const words = phrase.trim().split(/\s+/);
    return words.length === 12 && ethers.utils.isValidMnemonic(phrase);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 4;
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    // Validate seed phrase
    if (!seedPhrase.trim()) {
      newErrors.seedPhrase = 'Seed phrase is required';
    } else if (!validateSeedPhrase(seedPhrase)) {
      newErrors.seedPhrase = 'Please enter a valid 12-word seed phrase';
    }

    // Validate new password
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be at least 4 characters long';
    }

    // Validate password confirmation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        await onSuccess(seedPhrase.trim(), newPassword, saveInBackend);
      } catch (error) {
        setErrors({ seedPhrase: 'Failed to reset password. Please try again.' });
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && seedPhrase && newPassword && confirmPassword && !isLoading) {
      handleSubmit();
    }
  };

  const isFormValid = seedPhrase.trim() && newPassword && confirmPassword && newPassword === confirmPassword;

  return (
    <div className='reset-password-screen'>
      <div className="onboarding-screen">
        <div className="onboarding-header">
          <h1>
            <MdLockReset />
            Reset Password
          </h1>
          <p>
            Enter your 12-word seed phrase and create a new password to restore your wallet.
          </p>
        </div>

        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '16px',
          margin: '25px 0',
          fontSize: '14px',
          color: 'black'
        }}>
          <strong>⚠️ Important:</strong> Make sure you have the correct 12-word seed phrase.
          An incorrect seed phrase will create a different wallet.
        </div>

        <div className="onboarding-content">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Seed Phrase Input */}
            <div>
              <label className="onboarding-label">12-Word Seed Phrase</label>
              <textarea
                className={`onboarding-input ${errors.seedPhrase ? 'onboarding-input--error ' : ''}`}
                placeholder="Enter your 12-word seed phrase separated by spaces"
                value={seedPhrase}
                onChange={(e) => {
                  setSeedPhrase(e.target.value);
                  if (errors.seedPhrase) {
                    setErrors(prev => ({ ...prev, seedPhrase: undefined }));
                  }
                }}
                rows={3}
                style={{ resize: 'vertical', minHeight: '80px' }}
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
              />
              {errors.seedPhrase && (
                <div className="onboarding-error">{errors.seedPhrase}</div>
              )}
            </div>

            {/* New Password Input */}
            <div>
              <label className="onboarding-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`onboarding-input ${errors.newPassword ? 'onboarding-input--error ' : ''}`}
                  placeholder="Enter new password (min 4 characters)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors(prev => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '42%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              {errors.newPassword && (
                <div className="onboarding-error">{errors.newPassword}</div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="onboarding-label">Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`onboarding-input ${errors.confirmPassword ? 'onboarding-input--error ' : ''}`}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '42%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="onboarding-error">{errors.confirmPassword}</div>
              )}
            </div>

            {/* Save in Backend Option */}
            {showSaveOption && (
              <div className="onboarding-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={saveInBackend}
                    onChange={(e) => setSaveInBackend(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span>Save password in backend for easier access</span>
                </label>
              </div>
            )}
          </div>

        </div>


      </div>
      <div className={`onboarding-actions ${onBack ? 'with-back' : 'single'}`}>
        {onBack && (
          <button className="onboarding-btn back" onClick={onBack} disabled={isLoading}>
            <MdArrowBack />
            Back
          </button>
        )}

        <button
          className="onboarding-btn primary"
          onClick={handleSubmit}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </div>
  );
}