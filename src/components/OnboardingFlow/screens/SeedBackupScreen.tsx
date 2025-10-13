import React, { useState } from 'react';
import { MdSecurity, MdArrowBack, MdContentCopy, MdCheck } from 'react-icons/md';

interface SeedBackupScreenProps {
  mnemonic: string;
  onConfirm: (mnemonic: string) => void;
  onBack?: () => void;
}

export function SeedBackupScreen({ mnemonic, onConfirm, onBack }: SeedBackupScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  const words = mnemonic.split(' ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setShowManualCopy(true);
    }
  };

  const handleNext = () => {
    onConfirm(mnemonic);
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdSecurity />
          Backup Your Seed Phrase
        </h1>
        <p>
          Please store these words securely and privately. You'll need them to recover your wallet.
        </p>
      </div>
      
      <div className="onboarding-content">
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 300px)',
          overflow: 'hidden'
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 0',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              padding: '0 8px'
            }}>
              {words.map((word, index) => (
                <div key={index} style={{
                  background: 'rgba(149, 255, 93, 0.1)',
                  border: '2px solid rgba(149, 255, 93, 0.3)',
                  borderRadius: '8px',
                  padding: '16px 12px',
                  textAlign: 'center',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#95ff5d',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  minHeight: '60px',
                  justifyContent: 'center'
                }} data-openreplay-obscured>
                  <span style={{
                    color: 'rgba(149, 255, 93, 0.7)',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>{index + 1}</span>
                  <span style={{ wordBreak: 'break-word' }}>{word}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div style={{ 
            textAlign: 'center',
            marginBottom: '12px',
            flexShrink: 0
          }}>
            <button 
              className="onboarding-btn secondary"
              onClick={handleCopy}
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px',
                padding: '12px 20px',
                fontSize: '14px'
              }}
            >
              {copied ? (
                <>
                  <MdCheck />
                  Copied!
                </>
              ) : (
                <>
                  <MdContentCopy />
                  Copy to Clipboard
                </>
              )}
            </button>
          </div>
          
          <div style={{ 
            background: 'rgba(255, 243, 205, 0.1)', 
            border: '1px solid rgba(255, 234, 167, 0.3)', 
            borderRadius: '6px', 
            padding: '12px',
            flexShrink: 0
          }}>
            <p style={{ 
              margin: 0, 
              fontSize: '12px', 
              color: 'rgba(149, 255, 93, 0.8)',
              textAlign: 'center',
              lineHeight: '1.4'
            }}>
              <strong>⚠️ Important:</strong> Never share your seed phrase with anyone. 
              Store it safely offline.
            </p>
          </div>
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
          onClick={handleNext}
        >
          I've Saved It Securely
        </button>
      </div>
      
      {showManualCopy && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Manual Copy</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
              Copy your seed phrase manually:
            </p>
            <textarea
              value={mnemonic}
              readOnly
              onFocus={e => e.target.select()}
              style={{
                width: '100%',
                height: '80px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button 
              className="onboarding-btn secondary"
              onClick={() => setShowManualCopy(false)}
              style={{ width: '100%', marginTop: '16px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}