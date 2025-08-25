import React, { useState } from "react";
import { MdSecurity, MdCheck, MdArrowBack } from "react-icons/md";
import "./SeedPhrase.css";

interface ConfirmSeedPopupProps {
  words: string[];
  indices: number[];
  onSuccess: () => void;
  onFailure: () => void;
}

export const ConfirmSeedPopup: React.FC<ConfirmSeedPopupProps> = ({
  words,
  indices,
  onSuccess,
  onFailure,
}) => {
  // Sort Array (ascending or descending)
  const sortedIndices = [...indices].sort((a, b) => a - b);

  const [inputs, setInputs] = useState<string[]>(Array(words.length).fill(""));
  const [errors, setErrors] = useState<boolean[]>(Array(words.length).fill(false));
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  const handleChange = (wordIndex: number, value: string) => {
    const updated = [...inputs];
    updated[wordIndex] = value.trim();
    setInputs(updated);

    // Clear error when writing
    if (errors[wordIndex]) {
      const updatedErrors = [...errors];
      updatedErrors[wordIndex] = false;
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = () => {
    let hasErrors = false;
    const newErrors = [...errors];

    //valdiation world
    sortedIndices.forEach((wordIndex) => {
      if (inputs[wordIndex] !== words[wordIndex]) {
        newErrors[wordIndex] = true;
        hasErrors = true;
      } else {
        newErrors[wordIndex] = false;
      }
    });

    setErrors(newErrors);
    setHasAttempted(true);

    if (!hasErrors) {
      onSuccess();
    }
  };

  const handleReturn = () => {
    onFailure();
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2>
          <MdSecurity style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Confirm Backup
        </h2>
        <p className="warning">Enter the correct word for each position:</p>
        <div className="input-group">
          {sortedIndices.map((wordIndex) => (
            <div key={wordIndex} style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "4px",
                  float: "left",
                  marginTop: "8px",
                }}
              >
                {`Word #${wordIndex + 1}`}
              </label>
              <input
                type="text"
                className={`input-field ${errors[wordIndex] ? "error-input" : ""}`}
                style={errors[wordIndex] ? { borderColor: "red" } : {}}
                value={inputs[wordIndex]}
                onChange={(e) => handleChange(wordIndex, e.target.value)}
              />
              {errors[wordIndex] && (
                <div
                  style={{
                    color: "red",
                    fontSize: "12px",
                    marginTop: "4px",
                    clear: "both",
                  }}
                >
                  Incorrect word
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          className="popup-actions-row"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {hasAttempted && errors.some((error) => error) && (
            <button className="confirm-btn" onClick={handleReturn}>
              <MdArrowBack style={{ marginRight: "4px", verticalAlign: "middle" }} />
              Return
            </button>
          )}
          <button
            className="confirm-btn"
            onClick={handleSubmit}
            style={
              hasAttempted && errors.some((error) => error) ? { marginLeft: "auto" } : {}
            }
          >
            <MdCheck style={{ marginRight: "4px", verticalAlign: "middle" }} />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
