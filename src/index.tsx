import React, { useEffect, useState, ReactElement } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Matrix Rain Background Component
const MatrixRain = () => {
  const [columns, setColumns] = useState<ReactElement[]>([]);

  useEffect(() => {
    // Characters to use in the matrix rain
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const screenWidth = window.innerWidth;
    const columnCount = Math.floor(screenWidth / 15); // More columns with smaller spacing
    
    const newColumns: ReactElement[] = [];
    
    for (let i = 0; i < columnCount; i++) {
      const columnChars: ReactElement[] = [];
      const columnLength = 30 + Math.floor(Math.random() * 15); // Reduced character count for faster effect
      
      for (let j = 0; j < columnLength; j++) {
        const char = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        columnChars.push(
          <span key={`char-${j}`} style={{ 
            opacity: j === 0 ? 1 : j < 30 ? 0.98 : j < 60 ? 0.95 : j < 100 ? 0.9 : 1 - (j * 0.001), // Extremely slow fade-out for 10x longer visibility
            animationDelay: `${j * 0.01}s` // Faster cascade effect between characters
          }}>
            {char}
          </span>
        );
      }
      
      newColumns.push(
        <div 
          key={`column-${i}`} 
          className="matrix-column" 
          style={{ 
            left: `${i * 15}px`,
            animationDuration: `${15 + Math.random() * 20}s` // Faster animation (15-35s range)
          }}
        >
          {columnChars}
        </div>
      );
    }
    
    setColumns(newColumns);
    
    // Handle window resize
    const handleResize = () => {
      // Recalculate columns on window resize
      const newWidth = window.innerWidth;
      const newColumnCount = Math.floor(newWidth / 15);
      
      if (newColumnCount !== columnCount) {
        // Force re-render with new column count
        setColumns([]);
        setTimeout(() => {
          // This will trigger the useEffect again
          setColumns([]); 
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div className="matrix-rain">{columns}</div>;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <MatrixRain />
    <App />
  </React.StrictMode>
);

reportWebVitals();