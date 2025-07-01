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
        {showManualCopy && (
          <div className="manual-copy-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', minWidth: 300 }}>
              <h3 style={{ marginTop: 0 }}>Manual Copy</h3>
              <p>Copy your seed phrase manually:</p>
              <textarea
                value={mnemonic}
                readOnly
                style={{ width: '100%', minHeight: 40, marginBottom: 12 }}
                onFocus={e => e.target.select()}
              />
              <button onClick={() => setShowManualCopy(false)} style={{ marginRight: 8 }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
