import React from "react";
import "./SeedPhrase.css"; 
import { FaCopy } from "react-icons/fa";

export function SeedBackupPopup({ mnemonic, onConfirm }: { mnemonic: string, onConfirm: () => void }) {
  const words = mnemonic.split(" ");

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
  };

  return (
    <div className="popup-container">
      <div className="popup">
        <h2>🔐 Backup Your Seed Phrase</h2>
        <p className="warning">Do not share this phrase with anyone.</p>

        <div className="seed-grid">
          {words.map((word, index) => (
            <div key={index} className="seed-word">
              <span className="index">{index + 1}</span>
              <span>{word}</span>
            </div>
          ))}
        </div>

        <div className="popup-actions">
          <button className="copy-btn" onClick={handleCopy}>
            <FaCopy /> Copy All
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            ✅ Next
          </button>
        </div>
      </div>
    </div>
  );
}
