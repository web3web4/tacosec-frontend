import React from "react";
import "./SeedPhrase.css";

type Props = {
  password: string;
  passwordError: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
};

export const DecryptPrompt = ({ password, passwordError, onChange, onSubmit }: Props) => {
  return (
    <div className="popup-container">
      <div className="popup">
        <h2>🔐 Decrypt Your Wallet</h2>
        <p>Enter your encryption password to continue:</p>
        <input
          type="password"
          placeholder="Your encryption password"
          value={password}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
        {passwordError && <p style={{ color: "red", marginTop: 10 }}>{passwordError}</p>}
        <div className="popup-actions">
          <button className="confirm-btn" onClick={onSubmit}>
            🔓 Decrypt
          </button>
        </div>
      </div>
    </div>
  );
};
