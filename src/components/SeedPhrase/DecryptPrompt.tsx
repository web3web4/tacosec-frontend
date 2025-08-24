import React from "react";
import { MdLock, MdLockOpen } from "react-icons/md";
import "./SeedPhrase.css";
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
        </div>
      </div>
    </div>
  );
};
