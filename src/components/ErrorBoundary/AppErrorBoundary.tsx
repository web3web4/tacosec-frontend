import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { createAppError, handleSilentError } from '@/utils';

interface Props {
  children: ReactNode;
}

const AppErrorBoundary: React.FC<Props> = ({ children }) => {
  const handleAppError = (error: Error) => {
    const appError = createAppError(error, 'unknown', 'App-level error');
    handleSilentError(appError, 'AppErrorBoundary');
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