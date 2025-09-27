import React, { useState } from 'react';
import { MdDownload, MdArrowBack } from 'react-icons/md';
import { ethers } from 'ethers';

interface ImportWalletScreenProps {
  onImport: (mnemonic: string) => void;
  onBack?: () => void;
}

export function ImportWalletScreen({ onImport, onBack }: ImportWalletScreenProps) {
  const [seedPhrase, setSeedPhrase] = useState('');
  const [error, setError] = useState('');

  const words = seedPhrase.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  const isValid = wordCount === 12 && ethers.utils.isValidMnemonic(seedPhrase.trim());

  const handleSeedPhraseChange = (value: string) => {
    setSeedPhrase(value);
    setError('');
  };

  const handleImport = () => {
    const trimmedPhrase = seedPhrase.trim();
    
    if (!trimmedPhrase) {
      setError('Please enter your seed phrase');
      return;
    }
    
    if (wordCount !== 12) {
      setError('Seed phrase must contain exactly 12 words');
      return;
    }
    
    if (!ethers.utils.isValidMnemonic(trimmedPhrase)) {
      setError('Invalid seed phrase. Please check your words and try again.');
      return;
    }
    
    onImport(trimmedPhrase);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleImport();
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdDownload />
          Import Your Wallet
        </h1>
        <p>
          Enter your 12-word seed phrase to restore your existing wallet.
        </p>
      </div>
      
      <div className="onboarding-content">
        <div>
          <label className="onboarding-label">Seed Phrase</label>
          <textarea
            className={`onboarding-textarea ${error ? 'error' : ''}`}
            placeholder="Enter your 12-word seed phrase here, separated by spaces..."
            value={seedPhrase}
            onChange={(e) => handleSeedPhraseChange(e.target.value)}
            onKeyPress={handleKeyPress}
            autoFocus
            rows={4}
          />
          
          <div className="word-validation">
            <span className={`word-count ${
              isValid ? 'valid' : wordCount > 12 ? 'error' : 'warning'
            }`}>
              {wordCount}/12 words
            </span>
            
            {wordCount > 0 && wordCount !== 12 && (
              <span className="validation-message">
                {wordCount < 12 
                  ? `Need ${12 - wordCount} more words` 
                  : `Remove ${wordCount - 12} words`
                }
              </span>
            )}
            
            {isValid && (
              <span className="validation-success">✓ Ready to import</span>
            )}
          </div>
          
          {error && (
            <div className="onboarding-error">{error}</div>
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
          onClick={handleImport}
          disabled={!isValid}
        >
          Import Wallet
        </button>
      </div>
    </div>
  );
}