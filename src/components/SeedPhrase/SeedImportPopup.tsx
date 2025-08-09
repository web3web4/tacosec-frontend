import { useState } from "react";
import { MdDownload, MdClose, MdLockOpen } from "react-icons/md";
import { MetroSwal } from "../../utils/metroSwal";
import "./SeedPhrase.css";

export function SeedImportPopup({
  onImport,
  onCancel,
}: {
  onImport: (mnemonic: string) => Promise<void>; // تغيير هنا
  onCancel?: () => void;
}) {
  const [words, setWords] = useState(Array(12).fill(""));
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

const handleImport = async () => {
  const trimmedWords = words.map((w) => w.trim());
  const mnemonic = trimmedWords.join(" ");
  if (trimmedWords.includes("") || trimmedWords.length !== 12) {
    MetroSwal.fire({
      icon: "error",
      title: "Invalid Seed",
      text: "Please enter all 12 words correctly.",
    });
    return;
  }
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
    const trimmedWords = words.map((w) => w.trim());
    const mnemonic = trimmedWords.join(" ");
    if (trimmedWords.includes("") || trimmedWords.length !== 12) {
      MetroSwal.fire({
        icon: "error",
        title: "Invalid Seed",
        text: "Please enter all 12 words correctly."
      });
      return;
    }
    setLoading(true);
    onImport(mnemonic);
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2 className="popup-title"><MdDownload style={{marginRight: '8px', verticalAlign: 'middle'}} />Import Your Wallet</h2>
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
                onPaste={
                  index === 0
                    ? (e) => {
                        e.preventDefault();
                        const paste = e.clipboardData.getData("text");
                        const split = paste.trim().split(/\s+/);
                        if (split.length === 12) {
                          setWords(split);
                        } else {
                          handleChange(index, paste); 
                        }
                      }
                    : undefined
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
              <MdClose style={{marginRight: '4px', verticalAlign: 'middle'}} />Cancel
            </button>
          )}
          <button
            className="confirm-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Importing…" : <><MdLockOpen style={{marginRight: '4px', verticalAlign: 'middle'}} />Import</>}
          </button>
        </div>
      </div>
    </div>
  );
}
