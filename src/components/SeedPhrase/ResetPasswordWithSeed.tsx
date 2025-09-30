import { MdRefresh, MdClose, MdLockReset, MdDeleteForever, MdExpandMore, MdExpandLess } from "react-icons/md";
import { storagePublicKeyAndPassword } from "@/apiService";
import { useWallet } from "@/wallet/walletContext";
import { getIdentifier } from "@/utils";
import { MetroSwal } from "@/utils";
import { useUser } from "@/context";
import { useState } from "react";
import CryptoJS from "crypto-js";
import { ethers } from "ethers";
import { config } from "@/utils/config";


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

  const { userData, isBrowser , initDataRaw} = useUser();
  const { addressweb , address  } = useWallet();

  const handleReset = async () => {
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

    const fullKey = newPassword + "|" + config.TG_SECRET_SALT;
    const encrypted = CryptoJS.AES.encrypt(trimmed, fullKey).toString();
    localStorage.setItem(`encryptedSeed-${identifier}`, encrypted);
    localStorage.setItem(`seedBackupDone-${identifier}`, "true");
    if(saveOnServer) {
      try {
        const wallet = ethers.Wallet.fromMnemonic(trimmed);
        const publicKey = wallet.address;
        await storagePublicKeyAndPassword({publicKey, secret:newPassword},initDataRaw|| "");
        localStorage.setItem(`savePasswordInBackend`, "true"); 
      } catch (error) {
        console.log(error);
      }
    } else {
      localStorage.setItem(`savePasswordInBackend`, "false");
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
