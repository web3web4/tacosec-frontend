import React from 'react';
import { MdAccountBalanceWallet, MdDownload, MdAdd } from 'react-icons/md';

type PromptOptions = {
  onCreate: () => void;
  onImport: () => void;
  displayName: string;
};

// Legacy popup function - kept for backward compatibility
export function showInitialPrompt({ onCreate, onImport, displayName }: PromptOptions) {
  // This function is deprecated - use InitialPromptScreen component instead
  console.warn('showInitialPrompt is deprecated. Use InitialPromptScreen component instead.');
  
  // For now, we'll render the screen component in a simple way
  // This maintains backward compatibility while encouraging migration to the new component
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 400px;
    width: 90%;
    text-align: center;
  `;
  
  content.innerHTML = `
    <h2 style="margin-bottom: 1rem; color: #333;">Welcome ${displayName}!</h2>
    <p style="margin-bottom: 1rem; color: #666;">
      Welcome ${displayName} to our secret stashing and sharing service built on TACo! 🎉
    </p>
    <p style="margin-bottom: 2rem; color: #666;">
      You need a wallet to start enjoying our services!
    </p>
    <div style="display: flex; gap: 1rem; flex-direction: column;">
      <button id="create-btn" style="
        padding: 12px 24px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
      ">Create New Wallet</button>
      <button id="import-btn" style="
        padding: 12px 24px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
      ">Import Existing Wallet</button>
    </div>
  `;
  
  container.appendChild(content);
  document.body.appendChild(container);
  
  const createBtn = content.querySelector('#create-btn');
  const importBtn = content.querySelector('#import-btn');
  
  createBtn?.addEventListener('click', () => {
    document.body.removeChild(container);
    onCreate();
  });
  
  importBtn?.addEventListener('click', () => {
    document.body.removeChild(container);
    onImport();
  });
}

// New screen component interface
interface InitialPromptScreenProps {
  onChoice: (choice: 'create' | 'import') => void;
  displayName?: string;
}

// New screen component - recommended for use
export function InitialPromptScreen({ onChoice, displayName = 'Friend' }: InitialPromptScreenProps) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdAccountBalanceWallet />
          Welcome {displayName}!
        </h1>
        <p>
          Welcome {displayName} to our secret stashing and sharing service built on TACo! 🎉
        </p>
        <p>
          You need a wallet to start enjoying our services!
        </p>
      </div>
      
      <div className="onboarding-content">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
            Choose how you'd like to set up your wallet:
          </p>
        </div>
      </div>
      
      <div className="onboarding-actions">
        <button 
          className="onboarding-btn primary"
          onClick={() => onChoice('create')}
        >
          <MdAdd />
          Create New Wallet
        </button>
        
        <button 
          className="onboarding-btn secondary"
          onClick={() => onChoice('import')}
        >
          <MdDownload />
          Import Existing Wallet
        </button>
      </div>
    </div>
  );
}
