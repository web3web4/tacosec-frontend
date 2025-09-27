import React, { useState, useMemo } from 'react';
import { MdSecurity, MdArrowBack } from 'react-icons/md';

interface SeedConfirmScreenProps {
  words: string[];
  indices: number[];
  onSuccess: () => void;
  onBack?: () => void;
}

export function SeedConfirmScreen({ words, indices, onSuccess, onBack }: SeedConfirmScreenProps) {
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});
  const [errors, setErrors] = useState<{ [key: number]: boolean }>({});
  const [submitted, setSubmitted] = useState(false);

  // Sort indices for display
  const sortedIndices = useMemo(() => [...indices].sort((a, b) => a - b), [indices]);

  const handleChange = (wordIndex: number, value: string) => {
    setInputs(prev => ({ ...prev, [wordIndex]: value.trim().toLowerCase() }));
    
    // Clear error when user starts typing
    if (errors[wordIndex]) {
      setErrors(prev => ({ ...prev, [wordIndex]: false }));
    }
  };

  const validateInputs = () => {
    const newErrors: { [key: number]: boolean } = {};
    let hasErrors = false;

    sortedIndices.forEach(wordIndex => {
      const userInput = inputs[wordIndex]?.toLowerCase() || '';
      const correctWord = words[wordIndex]?.toLowerCase() || '';
      
      if (userInput !== correctWord) {
        newErrors[wordIndex] = true;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    
    if (validateInputs()) {
      onSuccess();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, wordIndex: number) => {
    if (e.key === 'Enter') {
      // Move to next input or submit if this is the last one
      const currentIndex = sortedIndices.indexOf(wordIndex);
      if (currentIndex < sortedIndices.length - 1) {
        const nextWordIndex = sortedIndices[currentIndex + 1];
        const nextInput = document.getElementById(`word-${nextWordIndex}`) as HTMLInputElement;
        nextInput?.focus();
      } else {
        handleSubmit();
      }
    }
  };

  const allFieldsFilled = sortedIndices.every(index => inputs[index]?.trim());

  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <h1>
          <MdSecurity />
          Confirm Backup
        </h1>
        <p>
          Enter the correct word for each position to verify your backup:
        </p>
      </div>
      
      <div className="onboarding-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedIndices.map((wordIndex, displayIndex) => (
            <div key={wordIndex}>
              <label className="onboarding-label">
                Word #{wordIndex + 1}
              </label>
              <input
                id={`word-${wordIndex}`}
                type="text"
                className={`onboarding-input ${
                  errors[wordIndex] ? 'error' : ''
                }`}
                placeholder={`Enter word #${wordIndex + 1}`}
                value={inputs[wordIndex] || ''}
                onChange={(e) => handleChange(wordIndex, e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, wordIndex)}
                autoFocus={displayIndex === 0}
                autoComplete="off"
                spellCheck={false}
              />
              {errors[wordIndex] && (
                <div className="onboarding-error">
                  Incorrect word. Please try again.
                </div>
              )}
            </div>
          ))}
        </div>
        
        {submitted && Object.keys(errors).length > 0 && (
          <div style={{
            background: '#ffebee',
            border: '1px solid #ffcdd2',
            borderRadius: '8px',
            padding: '16px',
            margin: '20px 0',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#c62828' }}>
              Some words are incorrect. Please check your seed phrase and try again.
            </p>
          </div>
        )}
      </div>
      
      <div className={`onboarding-actions ${onBack ? 'with-back' : 'single'}`}>
        {onBack && (
          <button className="onboarding-btn back" onClick={onBack}>
            <MdArrowBack />
            Back
          </button>
        )}
        
        <button 
          className="onboarding-btn primary"
          onClick={handleSubmit}
          disabled={!allFieldsFilled}
        >
          Verify & Complete
        </button>
      </div>
    </div>
  );
}