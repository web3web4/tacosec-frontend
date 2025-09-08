import { SeedPharseSettingPage, DecryptPrompt, ResetPasswordWithSeed, CustomPopup } from "@/components";
import { ContactSupport } from "@/section";
import { noUserImage } from "@/assets";
import { useWallet } from "@/wallet/walletContext";
import { MdDeleteForever } from "react-icons/md";
import { useUser } from "@/context";
import { useState, useEffect } from "react";
import { getIdentifier } from "@/utils";
import { useSetting } from "@/hooks";
import { MetroSwal } from "@/utils";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import "../../components/SeedPhrase/SeedPhrase.css";
import "./Settings.css";

const Settings: React.FC = () => {
  const { profileImage, notificationsOn, privacyModOn, handleToggleNotifications, handleTogglePrivacyMod,showSupportPopup, setShowSupportPopup } = useSetting();
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
    const identifier = getIdentifier(isBrowser, address, addressweb, userData?.telegramId);
    if (!identifier) return;
    const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
    if (!encrypted) {
      MetroSwal.error("Error", "No encrypted seed found.");
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
  const identifier = getIdentifier(isBrowser, address, addressweb, userData?.telegramId);
  if (!identifier) return;

  const encrypted = localStorage.getItem(`encryptedSeed-${identifier}`);
  if (!encrypted) return;

  const fullKey = password + "|" + process.env.REACT_APP_TG_SECRET_SALT;

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
    if (address) {
      navigator.clipboard.writeText(address)
        .then(() => {
          setShowCopied(true);
        })
        .catch(err => {
          console.error("Failed to copy address: ", err);
          MetroSwal.error("Error", "Failed to copy address");
        });
    }
  };

  // Format address to show only first four and last four characters
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    if (addr.length <= 8) return addr;
    return `${addr.substring(0, 4)}......${addr.substring(addr.length - 4)}`;
  };

  // Handle clear data functionality
  const handleClearData = () => {
    MetroSwal.fire({
      icon: "warning",
      title: "Warning",
      html: "When I click on the OK button, your wallet will be lost forever and cannot be recovered. Any data related to the wallet will also be deleted.",
      confirmButtonText: "OK",
      showCancelButton: true,
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Delete the specified localStorage items
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith("seedBackupDone-") ||
            key.startsWith("encryptedSeed-") ||
            key === "savePasswordInBackend"
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
            {userData?.firstName} {userData?.lastName}
          </div>
          <div className="address-container">
            <span>Address: </span>
            <span className="address-value">{formatAddress(address || undefined)}</span>
            <button 
              className="copy-address-btn" 
              onClick={copyAddressToClipboard}
              title="Copy full address"
            >
              📋
            </button>
            {showCopied && <span className="copied-message">Copied</span>}
          </div>
        </div>
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

        <div className="seed-section">
          <button className="seed-button" onClick={handleDecrypt}>
            Show Seed Phrase
          </button>
        </div>

        {/* New Clear Data section */}
        <div className="seed-section">
          <button 
            className="seed-button" 
            onClick={handleClearData}
          >
            <MdDeleteForever style={{marginRight: '4px'}} />
            Clear All Data
          </button>
        </div>

        <div className="support-section">
          <p>Support and Help</p>
          <button className="support-button" onClick={() => setShowSupportPopup(true)}>Contact Support</button>
        </div>
        
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
            MetroSwal.success("Success", "You can now unlock your wallet with your new password.");
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
              value={address || ""}
              readOnly
              onFocus={e => e.target.select()}
            />
            <button className="cancel-btn" onClick={() => setShowManualCopy(false)}>Close</button>
          </div>
        </div>
      )}

      <CustomPopup open={showSupportPopup} closed={setShowSupportPopup}>
        <ContactSupport setShowSupportPopup={setShowSupportPopup}/>
      </CustomPopup>
    </>
  );
};

export default Settings;
