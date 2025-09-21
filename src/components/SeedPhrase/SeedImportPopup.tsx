import { MdDownload, MdClose, MdLockOpen } from "react-icons/md";
import { MetroSwal } from "@/utils";
import { useState, useEffect } from "react";
import "./SeedPhrase.css";

export function SeedImportPopup({
  onImport,
  onCancel,
}: {
  onImport: (mnemonic: string) => Promise<void>;
  onCancel?: () => void;
}) {
  const [seedPhrase, setSeedPhrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  // Real-time validation
  useEffect(() => {
    const words = seedPhrase.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setIsValid(words.length === 12 && words.every(word => word.length > 0));
  }, [seedPhrase]);

  const handleSeedPhraseChange = (value: string) => {
    setSeedPhrase(value);
  };

const handleImport = async () => {
  const words = seedPhrase.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length !== 12) {
    MetroSwal.fire({
      icon: "error",
      title: "Invalid Seed Phrase",
      text: `Please enter exactly 12 words. You have entered ${words.length} words.`,
    });
    return;
  }

  const mnemonic = words.join(" ");
  setLoading(true);
  try {
    console.log("Calling onImport with mnemonic:", mnemonic);
    if (onCancel) {
      onCancel();
    }
    await onImport(mnemonic);
    console.log("onImport completed successfully");
  } catch (error) {
    console.error("Import error:", error);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = () => {
    const words = seedPhrase.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length !== 12) {
      MetroSwal.fire({
        icon: "error",
        title: "Invalid Seed Phrase",
        text: `Please enter exactly 12 words. You have entered ${words.length} words.`
      });
      return;
    }
    
    const mnemonic = words.join(" ");
    setLoading(true);
    onImport(mnemonic);
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2 className="popup-title"><MdDownload style={{marginRight: '8px', verticalAlign: 'middle'}} />Import Your Wallet</h2>
        <p className="warning">
          Enter your 12‑word seed phrase separated by spaces.
        </p>

        <div className="seed-input-container">
          <textarea
            value={seedPhrase}
            onChange={(e) => handleSeedPhraseChange(e.target.value)}
            className="seed-phrase-input"
            placeholder="Enter your 12-word seed phrase here, separated by spaces..."
            rows={4}
            autoFocus
          />
          <div className="seed-validation-info">
            <span className={`word-count ${isValid ? 'valid' : wordCount > 12 ? 'error' : 'warning'}`}>
              {wordCount}/12 words
            </span>
            {wordCount > 0 && wordCount !== 12 && (
              <span className="validation-message">
                {wordCount < 12 ? `Need ${12 - wordCount} more words` : `Remove ${wordCount - 12} words`}
              </span>
            )}
            {isValid && (
              <span className="validation-success">✓ Ready to import</span>
            )}
          </div>
        </div>

        <div className="popup-actions-row">
          {onCancel && (
            <button
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              <MdClose style={{marginRight: '4px', verticalAlign: 'middle'}} />Cancel
            </button>
          )}
          <button
            className="confirm-btn"
            onClick={handleSubmit}
            disabled={loading || !isValid}
          >
            {loading ? "Importing…" : <><MdLockOpen style={{marginRight: '4px', verticalAlign: 'middle'}} />Import</>}
          </button>
        </div>
      </div>
    </div>
  );
}
