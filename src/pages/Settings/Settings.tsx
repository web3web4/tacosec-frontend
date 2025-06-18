import useSetting from "../../hooks/useSetting";
import defaultProfileImage from "../../assets/images/no-User.png";
import "./Settings.css";
import { useUser } from "../../context/UserContext";
import { useWallet } from "../../wallet/walletContext";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import { SeedPharseSettingPage } from "../../components/SeedPhrase/SeedPhraseSettingPage";
import CryptoJS from "crypto-js";
import { DecryptPrompt } from "../../components/SeedPhrase/DecryptPrompt";
import { ResetPasswordWithSeed } from "../../components/SeedPhrase/ResetPasswordWithSeed";

const Settings: React.FC = () => {
  const { profileImage, notificationsOn, handleToggleNotifications } =
    useSetting();
  const { userData } = useUser();
  const { address } = useWallet();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showDecryptPrompt, setShowDecryptPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

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
    const encrypted = localStorage.getItem("encryptedSeed");
    if (!encrypted) {
      Swal.fire("Error", "No encrypted seed found.", "error");
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
    const encrypted = localStorage.getItem("encryptedSeed");
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
          Swal.fire("Error", "Failed to copy address", "error");
        });
    }
  };

  // Format address to show only first 5 characters
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.substring(0, 5)}...`;
  };

  return (
    <>
      <div className="settings-container">
        <h2 className="page-title">Settings</h2>
        <div className="profile-section">
          <div className="photo-preview">
            <img
              src={profileImage || defaultProfileImage}
              alt="Profile"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = defaultProfileImage;
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
        <div className="notifications-row">
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

        <div className="support-section">
          <p>Support and Help</p>
          <button className="support-button">Contact Support</button>
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
            Swal.fire(
              "Success",
              "You can now unlock your wallet with your new password.",
              "success"
            );
          }}
          onCancel={() => {
            setShowResetFlow(false);
            setShowDecryptPrompt(true); // Re-show the DecryptPrompt when Cancel is clicked
          }}
        />
      )}
    </>
  );
};

export default Settings;
