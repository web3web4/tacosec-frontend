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
  const [inputs, setInputs] = useState<string[]>(Array(indices.length).fill(""));
  const [errors, setErrors] = useState<boolean[]>(Array(indices.length).fill(false));
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  const handleChange = (index: number, value: string) => {
    const updated = [...inputs];
    updated[index] = value.trim();
    setInputs(updated);
    
    // Clear error for this field when user types
    if (errors[index]) {
      const updatedErrors = [...errors];
      updatedErrors[index] = false;
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = () => {
    let hasErrors = false;
    const newErrors = [...errors];
    
    // Check each word and mark errors
    inputs.forEach((word, idx) => {
      if (word !== words[indices[idx]]) {
        newErrors[idx] = true;
        hasErrors = true;
      } else {
        newErrors[idx] = false;
      }
    });
    
    setErrors(newErrors);
    setHasAttempted(true);
    
    if (!hasErrors) {
      onSuccess();
    }
    // We don't call onFailure() immediately anymore
  };

  const handleReturn = () => {
    onFailure(); // Return to the seedphrase interface
  };

  return (
    <div className="popup-container-seed">
      <div className="popup-seed">
        <h2><MdSecurity style={{marginRight: '8px', verticalAlign: 'middle'}} />Confirm Backup</h2>
        <p className="warning">Enter the correct word for each position:</p>
        <div className="input-group">
          {indices.map((wordIndex, idx) => (
            <div key={idx} style={{marginBottom: '16px'}}>
              <label style={{display: 'block', marginBottom: '4px', float: 'left', marginTop: '8px'}}>
                {`Word #${wordIndex + 1}`}
              </label>
              <input
                type="text"
                className={`input-field ${errors[idx] ? 'error-input' : ''}`}
                style={errors[idx] ? {borderColor: 'red'} : {}}
                value={inputs[idx]}
                onChange={(e) => handleChange(idx, e.target.value)} 
              />
              {errors[idx] && (
                <div style={{color: 'red', fontSize: '12px', marginTop: '4px', clear: 'both'}}>
                  Incorrect word
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="popup-actions-row" style={{display: 'flex', justifyContent: 'space-between'}}>
          {hasAttempted && errors.some(error => error) && (
            <button 
              className="confirm-btn" 
              onClick={handleReturn}
            >
              <MdArrowBack style={{marginRight: '4px', verticalAlign: 'middle'}} />
              Return
            </button>
          )}
          <button 
            className="confirm-btn" 
            onClick={handleSubmit}
            style={hasAttempted && errors.some(error => error) ? {marginLeft: 'auto'} : {}}
          >
            <MdCheck style={{marginRight: '4px', verticalAlign: 'middle'}} />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
