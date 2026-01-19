import { useState } from "react";
import { MdAccountBalanceWallet, MdDownload, MdAdd, MdInfo, MdContentCopy, MdHelpOutline, MdShield, MdWarning } from "react-icons/md";
import { useUser } from "@/context";
import { formatAddress } from '@/utils';
import Swal from 'sweetalert2';

interface WelcomeScreenProps {
  onChoice: (choice: "create" | "import") => void;
}

export function WelcomeScreen({ onChoice }: WelcomeScreenProps) {
  const { userData, isBrowser } = useUser();
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isLoading] = useState(false);

  const { firstName, lastName, username } = userData?.user || {};
  const displayName =
    (firstName && lastName && `${firstName} ${lastName}`) ||
    firstName ||
    lastName ||
    username ||
    (isBrowser ? "Web User" : "Telegram User");
  
  const address = userData?.user?.publicAddress;
  const hasExistingAddress = Boolean(address);

  const handleCopyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleCreateChoice = () => {
    if (hasExistingAddress) {
      // Show progressive disclosure warning for users with existing wallet
      Swal.fire({
        icon: 'warning',
        title: 'Create New Wallet?',
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 16px; color: #e0e0e0;">
              <strong style="color: #ff9800;">⚠️ Important:</strong> Creating a new wallet will generate a NEW 12-word seed phrase.
            </p>
            <p style="margin-bottom: 16px; color: #e0e0e0;">
              If you have secrets from your previous wallet, you will permanently lose access to them unless you have your old seed phrase saved.
            </p>
            <div style="background: rgba(255, 152, 0, 0.1); border-left: 3px solid #ff9800; padding: 12px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0; color: #ff9800; font-size: 14px;">
                <strong>We recommend "Restore My Wallet"</strong> if you still have your 12-word seed phrase.
              </p>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'I understand, create new',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#ff9800',
        cancelButtonColor: '#95ff5d',
        background: '#1a1a1a',
        color: '#fff',
        customClass: {
          confirmButton: 'swal-warning-btn',
          cancelButton: 'swal-cancel-btn'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          onChoice("create");
        }
      });
    } else {
      // New users proceed directly
      onChoice("create");
    }
  };

  const showHelpModal = () => {
    Swal.fire({
      title: 'Which Should I Choose?',
      html: `
        <div style="text-align: left; padding: 10px 0;">
          <div style="margin-bottom: 20px;">
            <h4 style="color: #95ff5d; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <svg style="width: 20px; height: 20px; fill: #95ff5d;" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              Create New Wallet
            </h4>
            <p style="color: #e0e0e0; margin-bottom: 8px;">Choose this if:</p>
            <ul style="color: #b0b0b0; margin: 0; padding-left: 20px;">
              <li>This is your first time using TacoSec</li>
              <li>You don't have a 12-word seed phrase</li>
              <li>You want to start fresh</li>
            </ul>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h4 style="color: #95ff5d; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <svg style="width: 20px; height: 20px; fill: #95ff5d;" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>
              Restore My Wallet
            </h4>
            <p style="color: #e0e0e0; margin-bottom: 8px;">Choose this if:</p>
            <ul style="color: #b0b0b0; margin: 0; padding-left: 20px;">
              <li>You have your 12-word seed phrase</li>
              <li>You're moving from another device</li>
              <li>You see your address above and want to keep it</li>
            </ul>
          </div>
          
          <div style="background: rgba(149, 255, 93, 0.1); border-left: 3px solid #95ff5d; padding: 12px; margin-top: 16px; border-radius: 4px; display: flex; gap: 8px; align-items: flex-start;">
            <svg style="width: 18px; height: 18px; fill: #95ff5d; flex-shrink: 0; margin-top: 2px;" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            <p style="margin: 0; color: #95ff5d; font-size: 13px;">
              <strong>Not sure?</strong> If you haven't used this app before, choose "Create New Wallet"
            </p>
          </div>
        </div>
      `,
      confirmButtonText: 'Got it!',
      confirmButtonColor: '#95ff5d',
      background: '#1a1a1a',
      color: '#fff',
      width: '400px',
      customClass: {
        confirmButton: 'swal-green-btn'
      }
    });
  };

  if (isLoading) {
    return (
      <div className="onboarding-screen welcome-screen-loading">
        <div className="skeleton-loader">
          <div className="skeleton skeleton-header"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-box"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-screen welcome-screen-animated">
      {/* User State Badge */}
      {hasExistingAddress && (
        <div className="user-state-badge returning-user">
          <MdAccountBalanceWallet style={{ fontSize: '18px' }} />
          <span>Returning User</span>
        </div>
      )}
      
      <div className="onboarding-header">
        <h1>
          <MdAccountBalanceWallet style={{ fontSize: '32px' }} />
          Welcome {displayName}!
        </h1>
        <p style={{ marginBottom: '8px' }}>
          Secure your secrets with <strong>threshold encryption</strong>
        </p>
        <p style={{ opacity: 0.7, fontSize: '14px' }}>
          Your wallet is the key to encrypting and accessing your data
        </p>
      </div>

      <div className="onboarding-content">
        {/* Contextual Information Box */}
        {hasExistingAddress ? (
          <div className="info-box existing-wallet-info">
            <div className="info-box-header">
              <MdInfo style={{ fontSize: '20px' }} />
              <span>Wallet Detected</span>
            </div>
            <div className="info-box-content">
              <p style={{ marginBottom: '12px' }}>
                We found a wallet associated with your account:
              </p>
              <div className="address-display">
                <code className="wallet-address">{formatAddress(6, address as string)}</code>
                <button 
                  className="copy-btn" 
                  onClick={handleCopyAddress}
                  title="Copy full address"
                >
                  <MdContentCopy style={{ fontSize: '16px' }} />
                  {copiedAddress && <span className="copied-tooltip">Copied!</span>}
                </button>
              </div>
              <div className="info-box-recommendation">
                <MdShield style={{ fontSize: '18px' }} />
                <div>
                  <strong>Recommendation:</strong> If this is your wallet from another device, 
                  choose "Restore My Wallet" and enter your 12-word seed phrase.
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="info-box new-user-info">
            <div className="info-box-header">
              <MdInfo style={{ fontSize: '20px' }} />
              <span>First Time Setup</span>
            </div>
            <div className="info-box-content">
              <ul className="info-list">
                <li>
                  <strong>New to TacoSec?</strong> Choose "Create New Wallet"
                </li>
                <li>
                  <strong>Have a seed phrase?</strong> Choose "Restore My Wallet"
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Privacy & Security Note */}
        <div className="privacy-note">
          <MdShield style={{ fontSize: '18px', color: '#95ff5d' }} />
          <span>Your seed phrase never leaves your device</span>
        </div>

        {/* Help Link */}
        <button className="help-link" onClick={showHelpModal}>
          <MdHelpOutline style={{ fontSize: '18px' }} />
          <span>Not sure? Help me choose</span>
        </button>
      </div>

      <div className="onboarding-actions">
        <button
          className={`onboarding-btn ${hasExistingAddress ? 'secondary' : 'primary'}`}
          onClick={handleCreateChoice}
        >
          <MdAdd style={{ fontSize: '20px' }} />
          Create New Wallet
        </button>

        <button
          className={`onboarding-btn ${hasExistingAddress ? 'primary' : 'secondary'}`}
          onClick={() => onChoice("import")}
        >
          <MdDownload style={{ fontSize: '20px' }} />
          Restore My Wallet
        </button>
      </div>

      {/* Credits Footer */}
      <div className="welcome-credits">
        <div className="credits-label">Made With Love By</div>
        <div className="credits-logo-container">
          <div className="credits-logo">
            <div className="logo-text-top">W3</div>
            <div className="logo-text-bottom">W4</div>
          </div>
          <div className="credits-brand">WEB3WEB4</div>
        </div>
      </div>
    </div>
  );
}
