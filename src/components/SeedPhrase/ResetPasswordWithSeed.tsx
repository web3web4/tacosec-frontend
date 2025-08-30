import React, { useState } from "react";
import { MdRefresh, MdClose, MdLockReset, MdDeleteForever, MdExpandMore, MdExpandLess } from "react-icons/md";
import { ethers } from "ethers";
import CryptoJS from "crypto-js";
import { MetroSwal } from "../../utils/metroSwal";
import { useUser } from "../../context/UserContext";
import { useWallet } from "../../wallet/walletContext";
import { storagePublicKeyAndPassword } from "../../apiService";

export const ResetPasswordWithSeed = ({
  onSuccess,
  onCancel, 
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) => {
  const [seed, setSeed] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showClearOption, setShowClearOption] = useState(false);
  const [saveOnServer, setSaveOnServer] = useState(false); // 👈 Checkbox state

  const { isBrowser, initDataRaw } = useUser();
  const {addressweb } = useWallet();

  const handleReset = async () => {
    const trimmed = seed.trim().toLowerCase();
    if (!ethers.utils.isValidMnemonic(trimmed)) {
      MetroSwal.fire("Error", "Invalid seed phrase", "error");
      return;
    }
    
    // Get wallet address from the existing seed phrase
    const wallet = ethers.Wallet.fromMnemonic(trimmed);
    const walletAddress = wallet.address;
    console.log("Retrieved wallet address from seed:", walletAddress);
    
    // For browser use addressweb or walletAddress, for Telegram use walletAddress
    const identifier = isBrowser ? addressweb  : walletAddress;
    console.log("Using identifier for storage:", identifier);

    if (newPassword.length < 4) {
      MetroSwal.fire("Error", "Password too short", "error");
      return;
    }

    const fullKey = newPassword + "|" + process.env.REACT_APP_TG_SECRET_SALT;
    const encrypted = CryptoJS.AES.encrypt(trimmed, fullKey).toString();
    localStorage.setItem(`encryptedSeed-${identifier}`, encrypted);
    localStorage.setItem(`seedBackupDone-${identifier}`, "true");

    if (saveOnServer) {
      localStorage.setItem("savePasswordInBackend", "true");

      // For browser use addressweb if available, otherwise use walletAddress
      const publicKey = isBrowser ? (addressweb || walletAddress) : walletAddress;
      const data = { publicKey, secret: newPassword };
      console.log("Saving data to server:", data);
      try {
        await storagePublicKeyAndPassword(data, initDataRaw || "");
      } catch (error) {
        console.error("Failed to save password in backend:", error);
        MetroSwal.fire("Warning", "Password saved locally but failed to sync with server", "warning");
      }
    } else {
      // For browser use addressweb if available, otherwise use walletAddress
      const publicKey = isBrowser ? (addressweb || walletAddress) : walletAddress;
      const data = { publicKey };
      try {
        await storagePublicKeyAndPassword(data, initDataRaw || "");
      } catch (error) {
        console.warn("Public key only sync failed:", error);
      }
    }

    MetroSwal.fire("✅ Success", "Password reset successfully", "success");
    onSuccess();
  };

  const handleClearData = () => {
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("seedBackupDone-") ||
        key.startsWith("encryptedSeed-") ||
        key === "savePasswordInBackend"
      ) {
        localStorage.removeItem(key);
      }
    });
    window.location.reload();
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2>
          <MdRefresh style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Reset Password
        </h2>
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

        {/* 👇 Save Password Into Server*/}
        <div style={{ marginTop: "10px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={saveOnServer}
              onChange={(e) => setSaveOnServer(e.target.checked)}
            />
            <span style={{ fontSize: "14px", color: "#444" }}>
              Save wallet password on our servers (encrypted)
            </span>
          </label>
        </div>

        <div className="popup-actions-row">
          <button className="cancel-btn" onClick={onCancel}>
            <MdClose style={{ marginRight: "4px", verticalAlign: "middle" }} />Cancel
          </button>
          <button className="confirm-btn" onClick={handleReset}>
            <MdLockReset style={{ marginRight: "4px", verticalAlign: "middle" }} />Reset
          </button>
        </div>

        {/* Expandable section for clear data option */}
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div
            onClick={() => setShowClearOption(!showClearOption)}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
            }}
          >
            {showClearOption ? <MdExpandLess /> : <MdExpandMore />}
            <span style={{ marginLeft: "5px" }}>More options</span>
          </div>

          {showClearOption && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                border: "1px solid #eee",
                borderRadius: "5px",
              }}
            >
              <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>
                If you don't have a seedphrase, you have one last option: delete all data to create a new wallet.
              </p>
              <button onClick={handleClearData} className="cancel-btn">
                <MdDeleteForever style={{ marginRight: "4px" }} />
                Clear All Data
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
