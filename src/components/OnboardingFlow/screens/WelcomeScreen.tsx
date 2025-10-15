import React from 'react';
import { MdAccountBalanceWallet, MdDownload, MdAdd } from 'react-icons/md';
import { useUser } from '@/context';

interface WelcomeScreenProps {
  onChoice: (choice: 'create' | 'import') => void;
}

export function WelcomeScreen({ onChoice }: WelcomeScreenProps) {
  const { userData } = useUser();
  
  const displayName = userData?.user?.firstName && userData?.user?.lastName
    ? `${userData?.user?.firstName} ${userData?.user?.lastName}`
    : userData?.user?.username
    ? userData.user.username
    : "Friend";
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