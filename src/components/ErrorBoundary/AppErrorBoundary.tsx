import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';

interface Props {
  children: ReactNode;
}

const AppErrorBoundary: React.FC<Props> = ({ children }) => {
  const handleAppError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('App-level error:', error, errorInfo);
  };

  return (
    <ErrorBoundary 
      level="app" 
      onError={handleAppError}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;