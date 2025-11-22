import { SeedPharseSettingPage, DecryptPrompt, ResetPasswordWithSeed, CustomPopup, SectionErrorBoundary } from "@/components";
import { ContactSupport } from "@/section";
import { noUserImage } from "@/assets";
import { useWallet } from "@/wallet/walletContext";
import { MdDeleteForever } from "react-icons/md";
import { useUser } from "@/context";
import { useState, useEffect } from "react";
import { formatAddress, getIdentifier, recordUserAction, config, copyToClipboard } from "@/utils";
import { useSetting } from "@/hooks";
import { MetroSwal } from "@/utils";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import "../../components/SeedPhrase/SeedPhrase.css";
import "./Settings.css";


const Settings: React.FC = () => {
  const { profileImage, notificationsOn, privacyModOn, handleToggleNotifications, handleTogglePrivacyMod,showSupportPopup, setShowSupportPopup , email, setEmail ,phone, setPhone,firstName, setFirstName,lastName, setLastName,saveUserInfo,isSavingUserInfo} = useSetting();
  const { userData , isBrowser } = useUser();
  const { address , addressweb } = useWallet();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showDecryptPrompt, setShowDecryptPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

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
   * Handles the decryption process by checking if an encrypted seed exists in local storage.
   * If no encrypted seed is found, displays an error message.
   * If an encrypted seed is found, shows the decryption prompt to the user.
   */

  const handleDecrypt = () => {
    const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);
    if (!identifier) return;
    const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
    if (!encrypted) {
      MetroSwal.error("Error", "We couldn't find a saved seed on this device.");
      return;
    }
    setShowDecryptPrompt(true);
  };

  /**
   * Attempts to decrypt the mnemonic seed phrase stored as an encrypted seed in local storage.
   * If successful, updates the state with the decrypted mnemonic and resets UI elements.
   * Otherwise, sets an error message indicating invalid password or corrupted data.
   */

const submitDecryption = () => {
  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.user?.telegramId);
  if (!identifier) return;

  const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
  if (!encrypted) return;

  const fullKey = password + "|" + config.TG_SECRET_SALT;

  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, fullKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!ethers.utils.isValidMnemonic(decrypted)) throw new Error();

    setMnemonic(decrypted);
    setShowDecryptPrompt(false);
    setPassword("");
    setPasswordError("");
  } catch {
    setPasswordError("❌ Invalid password or corrupted data.");
  }
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
            <div className="address-container">
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
                📋
              </button>
              {showCopied && <span className="copied-message">Copied</span>}
            </div>
          </div>
        </SectionErrorBoundary>
        <div className="checkbox-row">
          <span>Activate privacy mode</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={privacyModOn}
              onChange={handleTogglePrivacyMod}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="checkbox-row">
          <span>Turn on Notifications</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notificationsOn}
              onChange={handleToggleNotifications}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <p className="desc">Enable to receive updates and alerts.</p>

        {/* New: Browser-only user info fields under notifications */}
        {isBrowser && (
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
        )}

        <div className="seed-section">
          <button className="seed-button" onClick={() => {
            recordUserAction("Button click: View seed phrase");
            handleDecrypt();
          }}>
            Show Seed Phrase
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
            <MdDeleteForever style={{marginRight: '4px'}} />
            Clear All Data
          </button>
        </div>

        <SectionErrorBoundary sectionName="SupportSection">
          <div className="support-section">
            <p>Support and Help</p>
            <button className="support-button" onClick={() => {
              recordUserAction("Button click: Contact support");
              setShowSupportPopup(true);
            }}>Contact Support</button>
          </div>
        </SectionErrorBoundary>
        
      </div>

      {mnemonic && (
        <SeedPharseSettingPage
          mnemonic={mnemonic}
          onCancel={() => setMnemonic(null)}
        />
      )}

      {showDecryptPrompt && (
        <DecryptPrompt
          password={password}
          passwordError={passwordError}
          onChange={setPassword}
          onSubmit={submitDecryption}
          onForgotPassword={() => {
            setShowDecryptPrompt(false);
            setShowResetFlow(true);
          }}
        />
      )}

      {showResetFlow && (
        <ResetPasswordWithSeed
          onSuccess={() => {
            setShowResetFlow(false);
            MetroSwal.success("Password updated", "Your password has been updated. You can now unlock your wallet.");
          }}
          onCancel={() => {
            setShowResetFlow(false);
            setShowDecryptPrompt(true); // Re-show the DecryptPrompt when Cancel is clicked
          }}
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
            <button className="cancel-btn" onClick={() => setShowManualCopy(false)}>Close</button>
          </div>
        </div>
      )}

      <CustomPopup open={showSupportPopup} closed={setShowSupportPopup}>
        <SectionErrorBoundary sectionName="ContactSupport">
          <ContactSupport setShowSupportPopup={setShowSupportPopup}/>
        </SectionErrorBoundary>
      </CustomPopup>
    </>
  );
};

export default Settings;
