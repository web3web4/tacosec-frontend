import { useState } from "react";
import "./SeedPhrase.css";
import { FaCopy } from "react-icons/fa";

export function SeedBackupPopup({
  mnemonic,
  onConfirm,
}: {
  mnemonic: string;
  onConfirm: () => void;
}) {
  const words = mnemonic.split(" ");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
    });
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2 className="popup-title">🔐 Backup Your Seed Phrase</h2>
        <p className="warning">Please store these words securely and privately.</p>

        <div className="seed-grid">
          {words.map((word, index) => (
            <div key={index} className="seed-word">
              <span className="index">{index + 1}.</span>
              <span>{word}</span>
            </div>
          ))}
        </div>

        <div className="popup-actions-row">
          <button className="copy-btn" onClick={handleCopy}>
            <FaCopy /> Copy
             {copied && <span className="copy-feedback">✅ Copied!</span>}
          </button>
          <button className="confirm-btn" onClick={onConfirm}>
            ✅ Next
          </button>
        </div>
      </div>
    </div>
  );
}
