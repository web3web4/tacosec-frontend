import { formatAddress, getIdentifier, recordUserAction, copyToClipboard, getEncryptedSeed } from "@/utils";
import { SectionErrorBoundary, OnboardingFlow, SheetModal } from "@/components";
import { clearTokens } from "@/utils/cookieManager";
import { useWallet } from "@/wallet/walletContext";
import { MdDeleteForever, MdShield, MdContentCopy, MdLock } from "react-icons/md";
import { MetroSwal, showGDPR } from "@/utils";
import { useState, useEffect } from "react";
import { ContactSupport } from "@/section";
import { noUserImage } from "@/assets";
import { useSetting } from "@/hooks";
import { useUser } from "@/context";
import "@/pages/Home/Home.css";
import "./Settings.css";


const Settings: React.FC = () => {
  const { profileImage, privacyModOn, handleTogglePrivacyMod, showSupportPopup, setShowSupportPopup, email, setEmail, phone, setPhone, firstName, setFirstName, lastName, setLastName, saveUserInfo, isSavingUserInfo } = useSetting();
  const [showManualCopy, setShowManualCopy] = useState(false);
  const [showSeedFlow, setShowSeedFlow] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { address, addressweb } = useWallet();
  const { userData, isBrowser } = useUser();

  // Hide the "Copied" message after 2 seconds
  useEffect(() => {
    if (showCopied) {
      const timer = setTimeout(() => {
        setShowCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showCopied]);

  /**
   * Handles showing the seed phrase flow.
   * Checks if encrypted seed exists and shows the decrypt flow.
   */
  const handleShowSeedPhrase = () => {
    const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);
    if (!identifier) {
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to identify wallet'
      });
      return;
    }
    const encrypted = getEncryptedSeed(identifier || "");
    if (!encrypted || encrypted === null) {
      MetroSwal.fire({
        icon: 'error',
        title: 'Error',
        text: "We couldn't find a saved seed on this device."
      });
      return;
    }
    MetroSwal.fire({
      icon: 'warning',
      title: 'Reveal Seed Phrase',
      html: `
        <div style="text-align:left; line-height:1.6;">
          <p style="margin-bottom: 8px; color: #cfcfcf;">Your seed phrase unlocks all your secrets and funds.</p>
          <ul style="margin:0; padding-left:18px; color:#cfcfcf;">
            <li>Ensure no one is watching your screen</li>
            <li>Never share or store it unencrypted</li>
            <li>Prefer offline backup in a secure location</li>
          </ul>
        </div>
      `,
      confirmButtonText: 'Reveal',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: true
    }).then(res => {
      if (res.isConfirmed) {
        setShowSeedFlow(true);
      }
    });
  };

  // Function to copy address to clipboard
  const copyAddressToClipboard = () => {
    const addressToCopy = address || addressweb;
    if (addressToCopy) {
      copyToClipboard(
        addressToCopy,
        () => setShowCopied(true),
        () => setShowManualCopy(true)
      ).catch(err => {
        console.error("Failed to copy address: ", err);
        MetroSwal.error("Error", "We couldn't copy your address. Please try again.");
      });
    }
  };

  const retryCopy = () => {
    const addressToCopy = address || addressweb;
    if (!addressToCopy) return;
    copyToClipboard(
      addressToCopy,
      () => {
        setShowCopied(true);
        setShowManualCopy(false);
      },
      () => {}
    ).catch(() => {
      MetroSwal.fire({
        icon: 'error',
        title: 'Copy failed',
        text: 'Please copy manually using the text below.'
      });
    });
  };

  // Handle clear data functionality
  const handleClearData = () => {
    MetroSwal.fire({
      icon: "warning",
      title: "Delete all data?",
      html: "This will permanently remove your wallet and all related data from this device. This action cannot be undone.",
      confirmButtonText: "Delete",
      showCancelButton: true,
      cancelButtonText: "Keep data",
    }).then((result) => {
      if (result.isConfirmed) {
        // Delete the specified localStorage items
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("seedBackupDone-") ||
            key.startsWith("encryptedSeed-") ||
            key === "savePasswordInBackend" ||
            key === "publicAddress"
          ) {
            localStorage.removeItem(key);
          }
        });

        // For web users: clear auth cookies (access_token, refresh_token)
        if (isBrowser) {
          try {
            clearTokens();
          } catch (err) {
            console.error("Failed to clear auth tokens:", err);
          }
        }

        // Reload the page to reflect changes
        window.location.reload();
      }
    });
  };

  return (
    <>
      <div className="settings-container">
        <h2 className="page-title">Settings</h2>
        <SectionErrorBoundary sectionName="ProfileSection">
          <div className="profile-section">
            <div className="photo-preview">
              <img
                src={profileImage || noUserImage}
                alt="Profile"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = noUserImage;
                }}
              />
            </div>
            <div className="profile-name">
              {userData?.user?.firstName} {userData?.user?.lastName}
            </div>
            <div className="address-container" aria-live="polite" aria-atomic="true">
              <span>Address: </span>
              <span className="address-value">{formatAddress(4, address || addressweb || undefined)}</span>
              <button
                className="copy-address-btn"
                onClick={() => {
                  recordUserAction("Button click: Copy wallet address");
                  copyAddressToClipboard();
                }}
                title="Copy full address"
              >
                <MdContentCopy />
              </button>
              {showCopied && <span className="copied-message">Copied</span>}
            </div>
          </div>
        </SectionErrorBoundary>
        <h3 className="section-title">Security & Privacy</h3>
        <div className="checkbox-row">
          <span className="privacy-label">
            Max privacy mode
            <span
              className={`security-badge ${privacyModOn ? "on" : "off"}`}
              aria-live="polite"
            >
              {privacyModOn ? (
                <>
                  <MdShield style={{ marginRight: 4 }} /> Secure
                </>
              ) : (
                "Standard"
              )}
            </span>
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacyModOn}
              onChange={handleTogglePrivacyMod}
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* New: Browser-only user info fields under notifications */}
        {isBrowser && (
          <>
            <h3 className="section-title">Contact & Identity</h3>
            <div className="user-info-section">
              <div className="input-row">
                <label>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-row">
                <label>Phone number</label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="input-row">
                <label>First name</label>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>

              <div className="input-row">
                <label>Last name</label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>

              <button
                className="seed-button"
                onClick={() => {
                  recordUserAction("Button click: Save user info");
                  saveUserInfo();
                }}
                disabled={isSavingUserInfo}
                title="Save user information"
              >
                {isSavingUserInfo ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        )}

        <h3 className="section-title">Wallet Management</h3>
        <div className="seed-section">
          <button className="seed-button" onClick={() => {
            recordUserAction("Button click: View seed phrase");
            handleShowSeedPhrase();
          }}>
            <MdLock style={{ marginRight: 6 }} /> Show Seed Phrase
          </button>
        </div>

        {/* New Clear Data section */}
        <div className="seed-section">
          <button
            className="seed-button"
            onClick={() => {
              recordUserAction("Button click: Clear wallet data");
              handleClearData();
            }}
          >
            <MdDeleteForever style={{ marginRight: '4px' }} />
            Clear All Data
          </button>
        </div>

        <SectionErrorBoundary sectionName="SupportSection">
          <h3 className="section-title">Support</h3>
          <div className="support-section">
            <p>Support and Help</p>
            <button className="support-button" onClick={() => {
              recordUserAction("Button click: Contact support");
              setShowSupportPopup(true);
            }}>Contact Support</button>
            <button
              className="support-button"
              style={{ marginTop: '10px' }}
              onClick={() => {
                recordUserAction("Button click: View GDPR");
                showGDPR();
              }}
            >
              Privacy & GDPR
            </button>
          </div>
        </SectionErrorBoundary>

      </div>

      {showSeedFlow && (
        <OnboardingFlow
          initialStep="decrypt"
          onComplete={() => setShowSeedFlow(false)}
          viewSeedOnly={true}
          viewBack={false}
        />
      )}

      {/* Manual Copy Modal Fallback */}
      {showManualCopy && (
        <div className="manual-copy-modal">
          <div className="manual-copy-modal-content">
            <h3>Manual Copy</h3>
            <p>Copy your address manually:</p>
            <textarea
              className="manual-copy-textarea"
              value={address || addressweb || ""}
              readOnly
              onFocus={e => e.target.select()}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
              <button className="seed-button" onClick={retryCopy}>Copy Again</button>
              <button className="seed-button" onClick={() => setShowManualCopy(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <SheetModal open={showSupportPopup} onClose={setShowSupportPopup} title="Contact Support">
        <SectionErrorBoundary sectionName="ContactSupport">
          <ContactSupport setShowSupportPopup={setShowSupportPopup} />
        </SectionErrorBoundary>
      </SheetModal>
    </>
  );
};

export default Settings;
