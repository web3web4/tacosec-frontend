import { MdSecurity, MdCheck, MdClose } from "react-icons/md";
import { FaCopy } from "react-icons/fa";
import { useState } from "react";
import "./SeedPhrase.css";

export function SeedPharseSettingPage({
  mnemonic,
  onCancel,
}: {
  mnemonic: string;
  onCancel: () => void;
}) {
  const words = mnemonic.split(" ");
  const [copied, setCopied] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
    }).catch(() => {
      setShowManualCopy(true);
    });
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2 className="popup-title"><MdSecurity style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Backup Your Seed Phrase</h2>
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
             {copied && <span className="copy-feedback"><MdCheck style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Copied!</span>}
          </button>
          <button className="confirm-btn" onClick={onCancel}>
            <MdClose style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Cancel
          </button>
        </div>
        {showManualCopy && (
          <div className="manual-copy-modal">
            <div className="manual-copy-modal-content">
              <h3>Manual Copy</h3>
              <p>Copy your seed phrase manually:</p>
              <textarea
                className="manual-copy-textarea"
                value={mnemonic}
                readOnly
                onFocus={e => e.target.select()}
              />
              <button className="cancel-btn" onClick={() => setShowManualCopy(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
