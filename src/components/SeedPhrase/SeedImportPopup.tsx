import { useState } from "react";
import { MetroSwal } from "../../utils/metroSwal";
import "./SeedPhrase.css";

export function SeedImportPopup({
  onImport,
  onCancel,
}: {
  onImport: (mnemonic: string) => void;
  onCancel?: () => void;
}) {
  const [words, setWords] = useState(Array(12).fill(""));
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleSubmit = () => {
    const trimmedWords = words.map((w) => w.trim());
    const mnemonic = trimmedWords.join(" ");
    if (trimmedWords.includes("") || trimmedWords.length !== 12) {
      MetroSwal.error("Invalid Seed", "Please enter all 12 words correctly.");
      return;
    }
    setLoading(true);
    onImport(mnemonic);
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2 className="popup-title">🧩 Import Your Wallet</h2>
        <p className="warning">
          Enter your 12‑word seed phrase in the correct order.
        </p>

        <div className="seed-grid">
          {words.map((word, index) => (
            <div key={index} className="seed-word">
              <span className="index">{index + 1}.</span>
              <input
                type="text"
                value={word}
                autoFocus={index === 0}
                onChange={(e) => handleChange(index, e.target.value)}
                onBlur={() =>
                  handleChange(index, words[index].trim())
                }
                className="seed-input"
                placeholder={`Word ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <div className="popup-actions-row">
          {onCancel && (
            <button
              className="cancel-btn"
              onClick={onCancel}
              disabled={loading}
            >
              ❌ Cancel
            </button>
          )}
          <button
            className="confirm-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Importing…" : "🔐 Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
