import React from "react";
import "./SeedPhrase.css";

type Props = {
  password: string;
  passwordError: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
};

export const DecryptPrompt = ({
  password,
  passwordError,
  onChange,
  onSubmit,
  onForgotPassword,
}: Props) => {
  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2>🔐 Decrypt Your Wallet</h2>
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
            🔓 UnLoack
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
