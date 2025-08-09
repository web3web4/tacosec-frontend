import React from "react";
import { MdLock, MdLockOpen } from "react-icons/md";
import "./SeedPhrase.css";
import MetroSwal from "sweetalert2";
import { useUser } from "../../context/UserContext";

type Props = {
  password: string;
  passwordError: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onHidePrompt?: (show?: boolean) => void; // Updated to accept a boolean parameter
};

export const DecryptPrompt = ({
  password,
  passwordError,
  onChange,
  onSubmit,
  onForgotPassword,
  onHidePrompt,
}: Props) => {
  const { userData } = useUser();

  const handleClearData = () => {
    // Hide the decrypt prompt when Clear Data is clicked
    if (onHidePrompt) {
      onHidePrompt(false); // Explicitly hide the prompt
    }
    
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
      } else {
        // If Cancel is clicked, show the decrypt prompt again
        onHidePrompt?.(false);
      }
    });
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2><MdLock style={{marginRight: '8px', verticalAlign: 'middle'}} />Decrypt Your Wallet</h2>
        <p>Enter your password to continue:</p>
        <input
          type="password"
          placeholder="Your encryption password"
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
        {passwordError && (
          <p style={{ color: "red", marginTop: 10 }}>{passwordError}</p>
        )}
        <div className="popup-actions">
          <button className="confirm-btn" onClick={onSubmit}>
            <MdLockOpen style={{marginRight: '4px', verticalAlign: 'middle'}} />UnLoack
          </button>

          <p
            className="forgot-password"
            onClick={onForgotPassword}
            style={{
              cursor: "pointer",
              marginTop: 12,
              color: "#4CAF50",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            Forgot password?
          </p>
          
          <p
            className="clear-data"
            onClick={handleClearData}
            style={{
              cursor: "pointer",
              marginTop: 8,
              color: "#f44336",
              textAlign: "center",
              textDecoration: "underline",
            }}
          >
            Clear Data
          </p>
        </div>
      </div>
    </div>
  );
};
