import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: ReactNode;
  sectionName?: string;
  fallback?: ReactNode;
}

const SectionErrorBoundary: React.FC<Props> = ({ children, sectionName, fallback }) => {
  const handleSectionError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Section error in ${sectionName || 'unknown section'}:`, error, errorInfo);
  };

  return (
    <ErrorBoundary 
      level="section" 
      onError={handleSectionError}
      fallback={fallback}
    >
      {children}
    </ErrorBoundary>
  );
};

export default SectionErrorBoundary;