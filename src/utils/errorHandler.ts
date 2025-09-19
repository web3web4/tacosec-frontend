import { MetroSwal } from './metroSwal';

// Standard error types for the application
export interface AppError {
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  message: string;
  originalError?: Error;
  statusCode?: number;
}

// Create standardized error from different sources
export function createAppError(
  error: unknown,
  type: AppError['type'] = 'unknown',
  customMessage?: string
): AppError {
  if (error instanceof Error) {
    return {
      type,
      message: customMessage || error.message,
      originalError: error,
    };
  }
  
  return {
    type,
    message: customMessage || 'An unexpected error occurred',
    originalError: error instanceof Error ? error : undefined,
  };
}

// Handle API response errors
export function handleApiError(response: Response, customMessage?: string): AppError {
  let type: AppError['type'] = 'server';
  let message = customMessage || `HTTP error! status: ${response.status}`;

  if (response.status === 401) {
    type = 'auth';
    message = 'Authentication failed. Please log in again.';
    // Clear invalid token
    localStorage.removeItem('jwt_token');
  } else if (response.status >= 400 && response.status < 500) {
    type = 'validation';
  } else if (response.status >= 500) {
    type = 'server';
  } else if (!navigator.onLine) {
    type = 'network';
    message = 'Network connection lost. Please check your internet connection.';
  }

  return {
    type,
    message,
    statusCode: response.status,
  };
}

// Show error to user with consistent UI
export function showError(error: AppError, title?: string): void {
  const errorTitle = title || getErrorTitle(error.type);
  
  MetroSwal.fire({
    icon: 'error',
    title: errorTitle,
    text: error.message,
  });
}

// Get appropriate title for error type
function getErrorTitle(type: AppError['type']): string {
  switch (type) {
    case 'auth':
      return 'Authentication Error';
    case 'network':
      return 'Connection Error';
    case 'validation':
      return 'Validation Error';
    case 'server':
      return 'Server Error';
    default:
      return 'Error';
  }
}

// Simple wrapper for API calls with error handling
export async function handleApiCall<T>(
  apiCall: () => Promise<Response>,
  errorMessage?: string,
  responseType: 'json' | 'text' = 'json'
): Promise<T> {
  try {
    const response = await apiCall();
    
    if (!response.ok) {
      throw handleApiError(response, errorMessage);
    }
    
    if (responseType === 'text') {
      return await response.text() as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'type' in error) {
      // Already an AppError
      throw error;
    }
    
    // Convert to AppError
    const appError = createAppError(error, 'network', errorMessage);
    throw appError;
  }
}

// Silent error handling (for non-critical operations)
export function handleSilentError(error: unknown, context?: string): void {
  const appError = createAppError(error, 'unknown');
  console.error(`error${context ? ` in ${context}` : ''}:`, appError);
}