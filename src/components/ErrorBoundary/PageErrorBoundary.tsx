import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: ReactNode;
  pageName?: string;
}

const PageErrorBoundary: React.FC<Props> = ({ children, pageName }) => {
  const handlePageError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error(`Page error in ${pageName || 'unknown page'}:`, error, errorInfo);
  };

  return (
    <ErrorBoundary 
      level="page" 
      onError={handlePageError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default PageErrorBoundary;