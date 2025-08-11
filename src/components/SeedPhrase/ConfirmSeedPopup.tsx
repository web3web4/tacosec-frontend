import React, { useState } from "react";
import { MdSecurity, MdCheck } from "react-icons/md";
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
  const [inputs, setInputs] = useState<string[]>(Array(indices.length).fill(""));

  const handleChange = (index: number, value: string) => {
    const updated = [...inputs];
    updated[index] = value.trim();
    setInputs(updated);
  };

  const handleSubmit = () => {
    const isValid = inputs.every((word, idx) => word === words[indices[idx]]);
    if (isValid) {
      onSuccess();
    } else {
      onFailure();
    }
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2><MdSecurity style={{marginRight: '8px', verticalAlign: 'middle'}} />Confirm Backup</h2>
        <p className="warning">Enter the correct word for each position:</p>
        <div className="input-group">
          {indices.map((wordIndex, idx) => (
            <input
              key={idx}
              type="text"
              className="input-field"
              placeholder={`Word #${wordIndex + 1}`}
              value={inputs[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
            />
          ))}
        </div>
        <div className="popup-actions-row">
          <button className="confirm-btn" onClick={handleSubmit}>
            <MdCheck style={{marginRight: '4px', verticalAlign: 'middle'}} />Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
