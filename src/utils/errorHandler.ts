import { MetroSwal } from './metroSwal';
import { clearToken, getToken } from '@/utils';
import { storeFrontendLog } from '@/apiService';
import { FrontendLogPayload } from '@/types/types';
import { useUser } from '@/context';

// Standard error types for the application
export interface AppError {
  type: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  message: string;
  originalError?: Error;
  statusCode?: number;
}
let userActions: string[] = [];

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
    clearToken();
    // Redirect to home or login page if needed
    //window.location.href = '/';
  } else if (response.status === 403) {
    type = 'auth';
    message = 'You do not have permission to access this resource.';
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

export function recordUserAction(action: string) {
  if (userActions.length > 20) userActions.shift();
  userActions.push(`[${new Date().toISOString()}] ${action}`);
}


// Silent error handling (for non-critical operations)
export async function handleSilentError(error: unknown, context?: string): Promise<void> {
  const appError = createAppError(error, 'unknown');
  console.error(`error${context ? ` in ${context}` : ''}:`, appError);

  let level: FrontendLogPayload['level'] = 'info';
  switch (appError.type) {
    case 'server':
      level = 'error';
      break;
    case 'validation':
    case 'network':
      level = 'warn';
      break;
    default:
      level = 'info';
  }

  const payload: FrontendLogPayload = {
    timestamp: new Date().toISOString(),
    context: context || 'unknown',
    level,
    type: appError.type,
    message: appError.message,
    stack: appError.originalError?.stack || null,
    statusCode: appError.statusCode || null,
    url: window.location.href,
    userAgent: navigator.userAgent,
    userActions: [...userActions],
    token: getToken() || null,
    publicAddress : localStorage.getItem('publicAddress') || null,
    savePasswordInBackend : localStorage.getItem('savePasswordInBackend') || null,
  };

  try {
    await storeFrontendLog(payload);
  } catch (e) {
    console.warn('Failed to send frontend log:', e);
  }
}

