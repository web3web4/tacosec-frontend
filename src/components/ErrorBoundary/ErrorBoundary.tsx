import React, { Component, ReactNode } from 'react';
import { createAppError, handleSilentError } from '@/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'app' | 'page' | 'section' | 'component';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  // Called when a child component throws an error during rendering or in the lifecycle.
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  // Called after an error occurs to enable side effects: logging the error, sending reports.
  // Receives error and errorInfo; the latter contains a componentStack useful for tracking the location of the error in the component tree.
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    const appError = createAppError(error, 'unknown', `React Error Boundary (${this.props.level || 'component'})`);
    handleSilentError(appError, `ErrorBoundary-${this.props.level || 'component'}`);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  
  render() {
    if (this.state.hasError) {
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }

  private renderDefaultFallback() {
    const { level = 'component' } = this.props;

    const errorStyles: React.CSSProperties = {
      padding: '20px',
      margin: '10px',
      border: '1px solid #ff6b6b',
      borderRadius: '8px',
      backgroundColor: '#fff5f5',
      color: '#c92a2a',
      textAlign: 'center',
      fontFamily: 'inherit',
    };

    const buttonStyles: React.CSSProperties = {
      marginTop: '15px',
      padding: '8px 16px',
      backgroundColor: '#228be6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    };

    switch (level) {
      case 'app':
        return (
          <div style={{ ...errorStyles, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1>🚨 Application Error</h1>
            <p>Something went wrong with the application. Please refresh the page.</p>
            <button 
              style={buttonStyles}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        );

      case 'page':
        return (
          <div style={{ ...errorStyles, minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2>⚠️ Page Error</h2>
            <p>This page encountered an error. You can try again or navigate to another page.</p>
            <div>
              <button style={buttonStyles} onClick={this.handleRetry}>
                Try Again
              </button>
              <button 
                style={{ ...buttonStyles, marginLeft: '10px', backgroundColor: '#868e96' }}
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          </div>
        );

      case 'section':
        return (
          <div style={errorStyles}>
            <h3>⚠️ Section Error</h3>
            <p>This section couldn't load properly.</p>
            <button style={buttonStyles} onClick={this.handleRetry}>
              Retry
            </button>
          </div>
        );

      default: // component level
        return (
          <div style={{ ...errorStyles, padding: '15px', margin: '5px' }}>
            <p>⚠️ Component Error</p>
            <button 
              style={{ ...buttonStyles, padding: '6px 12px', fontSize: '12px' }}
              onClick={this.handleRetry}
            >
              Retry
            </button>
          </div>
        );
    }
  }
}

export default ErrorBoundary;