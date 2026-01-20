import { useState } from "react";
import { MdAccountBalanceWallet, MdDownload, MdAdd, MdHelpOutline, MdShield } from "react-icons/md";
import { useUser } from "@/context";
import Swal from 'sweetalert2';
import TacoLogo from '@/assets/images/TACoSec.jpg';

interface WelcomeScreenProps {
  onChoice: (choice: "create" | "import") => void;
}

export function WelcomeScreen({ onChoice }: WelcomeScreenProps) {
  const { userData, isBrowser } = useUser();
  const [isLoading] = useState(false);

  const { firstName, lastName, username } = userData?.user || {};
  const displayName =
    (firstName && lastName && `${firstName} ${lastName}`) ||
    firstName ||
    lastName ||
    username ||
    (isBrowser ? "Friend" : "Friend");

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
      <div className="onboarding-header">
        <h1>
          <MdAccountBalanceWallet style={{ fontSize: '32px' }} />
          Welcome {displayName}!
        </h1>
        <p>
          Secure your secrets with <strong>threshold encryption</strong>
        </p>
      </div>

      <div className="onboarding-content">
        {/* Action Cards Container */}
        <div className="action-card-container">
          {/* Create New Wallet Card */}
          <div className="action-card">
            <div className="action-card-icon">
              <MdAdd style={{ fontSize: '32px' }} />
            </div>
            <h3 className="action-card-title">Create New Wallet</h3>
            <p className="action-card-description">
              <strong>New to TacoSec?</strong> Start fresh with a new 12-word seed phrase. Perfect if this is your first time here.
            </p>
            <button
              className="action-card-button"
              onClick={() => onChoice("create")}
            >
              <MdAdd style={{ fontSize: '18px' }} />
              Create New Wallet
            </button>
          </div>

          {/* Restore Wallet Card */}
          <div className="action-card">
            <div className="action-card-icon">
              <MdDownload style={{ fontSize: '32px' }} />
            </div>
            <h3 className="action-card-title">Restore My Wallet</h3>
            <p className="action-card-description">
              <strong>Have a seed phrase?</strong> Restore your existing wallet from another device or backup using your 12-word recovery phrase.
            </p>
            <button
              className="action-card-button"
              onClick={() => onChoice("import")}
            >
              <MdDownload style={{ fontSize: '18px' }} />
              Restore My Wallet
            </button>
          </div>
        </div>

        {/* Privacy & Security Note */}
        <div className="privacy-note">
          <MdShield style={{ fontSize: '18px', color: '#95ff5d' }} />
          <span>Your seed phrase never leaves your device</span>
        </div>

        {/* Help Link */}
        <button className="help-link" onClick={showHelpModal}>
          <MdHelpOutline style={{ fontSize: '18px' }} />
          <span>Help me Decide</span>
        </button>
      </div>

      {/* Credits Footer */}
      <div className="welcome-credits">
        <div className="credits-row">
          <div className="made-by">
            <div className="credits-label">Made With Love By</div>
            <div className="credits-logo-container">
              <div className="credits-logo">
                <div className="logo-text-top">W3</div>
                <div className="logo-text-bottom">W4</div>
              </div>
              <div className="credits-brand">WEB3WEB4</div>
            </div>
          </div>

          <div className="powered-by">
            <div className="credits-label">Powered By</div>
            <div className="credits-logo-container">
              <div className="powered-logo">
                <img src={TacoLogo} alt="TACoSec" className="powered-logo-img" />
              </div>
              <div className="powered-brand">TACoSec</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
