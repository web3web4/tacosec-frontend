import useSetting from "../../hooks/useSetting";
import defaultProfileImage from "../../assets/images/no-User.png";
import "./Settings.css";
import { useUser } from "../../context/UserContext";
import { useWallet } from "../../wallet/walletContext";
import { useState } from "react";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import { SeedPharseSettingPage } from "../../components/SeedPhrase/SeedPhraseSettingPage";
import CryptoJS from "crypto-js";
import { DecryptPrompt } from "../../components/SeedPhrase/DecryptPrompt";

const Settings: React.FC = () => {
  const { profileImage, notificationsOn, handleToggleNotifications } = useSetting();
  const { userData } = useUser();
  const {address} = useWallet();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [showDecryptPrompt, setShowDecryptPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");


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
        <div className="profile-name">{ userData?.firstName } { " " } {userData?.lastName}</div>
        <div className="profile-name">Address : {address}</div>

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
        <button className="seed-button" onClick={handleDecrypt}>Show Seed Phrase</button>
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
        />
      )}

    </>
  );

};

export default Settings;
