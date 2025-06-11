// components/SeedPhrase/ConfirmSeedPopup.tsx

import React, { useState } from "react";

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
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8, background: "#f9f9f9", maxWidth: 400, margin: "auto" }}>
      <h3>Confirm Backup</h3>
      <p>Enter the correct word for each position:</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {indices.map((wordIndex, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Word #${wordIndex + 1}`}
            value={inputs[idx]}
            onChange={(e) => handleChange(idx, e.target.value)}
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
          />
        ))}
        <button onClick={handleSubmit} style={{ padding: 10, backgroundColor: "#1e88e5", color: "#fff", border: "none", borderRadius: 4 }}>
          Confirm
        </button>
      </div>
    </div>
  );
};
