import React, { useState } from "react";
import { MdRefresh, MdClose, MdLockReset } from "react-icons/md";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { MetroSwal } from "../../utils/metroSwal";
import { useUser } from "../../context/UserContext";
import { getIdentifier } from "../../utils/walletIdentifiers";
import { useWallet } from "../../wallet/walletContext";

export const ResetPasswordWithSeed = ({
  onSuccess,
  onCancel, 
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [seed, setSeed] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const {userData , isBrowser} = useUser();
  const { address , addressweb } = useWallet();
  const handleReset = () => {
    const identifier = getIdentifier(isBrowser, address, addressweb, userData?.telegramId);
      if (!identifier) return;
    const trimmed = seed.trim().toLowerCase();
    if (!ethers.utils.isValidMnemonic(trimmed)) {
      MetroSwal.fire("Error", "Invalid seed phrase", "error");
      return;
    }

    if (newPassword.length < 4) {
      MetroSwal.fire("Error", "Password too short", "error");
      return;
    }

    const fullKey = newPassword + "|" + process.env.REACT_APP_TG_SECRET_SALT;
    const encrypted = CryptoJS.AES.encrypt(trimmed, fullKey).toString();
    localStorage.setItem(`encryptedSeed-${identifier}`, encrypted);
    localStorage.setItem(`seedBackupDone-${identifier}`, "true");

    MetroSwal.fire("✅ Success", "Password reset successfully", "success");
    onSuccess(); // go back to login or main screen
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2><MdRefresh style={{marginRight: '8px', verticalAlign: 'middle'}} />Reset Password</h2>
        <p>Enter your 12-word seed phrase:</p>
        <textarea
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="seed phrase"
          className="input-field"
          rows={3}
        />
        <p>Enter a new password:</p>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="new password"
          className="input-field"
        />
        <div className="popup-actions-row">
          <button className="cancel-btn" onClick={onCancel}>
            <MdClose style={{marginRight: '4px', verticalAlign: 'middle'}} />Cancel
          </button>
          <button className="confirm-btn" onClick={handleReset}>
            <MdLockReset style={{marginRight: '4px', verticalAlign: 'middle'}} />Reset
          </button>
        </div>
      </div>
    </div>
  );
};
