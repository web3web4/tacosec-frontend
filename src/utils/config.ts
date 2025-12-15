/**
 * Environment Configuration Utility
 * 
 * This module centralizes access to environment variables, providing:
 * - Type safety
 * - Default values
 * - Consistent access patterns
 * - Protection against undefined values
 */

// Environment variable configuration with types and defaults
interface EnvConfig {
  // Telegram
  TG_SECRET_SALT: string;
  
  // Taco App
  TACO_DOMAIN: string;
  TACO_RITUAL_ID: number;
  BOT_USER_NAME: string;
  
  // API and Services
  API_BASE_URL: string;
  RPC_PROVIDER_URL: string;
  
  // Analytics
  OPENREPLAY_PROJECT_KEY: string;
}

// Get environment variable with type conversion and default value
function getEnv<T>(key: string, defaultValue: T, converter?: (value: string) => T): T {
  const envKey = `REACT_APP_${key}`;
  const value = process.env[envKey];
  
  if (value === undefined) {
    console.warn(`Environment variable ${envKey} is not defined, using default value`);
    return defaultValue;
  }
  
  if (converter) {
    try {
      return converter(value);
    } catch (error) {
      console.error(`Failed to convert ${envKey} value`, error);
      return defaultValue;
    }
  }
  
  return value as unknown as T;
}

// Export environment configuration
export const config: EnvConfig = {
  // Telegram
  TG_SECRET_SALT: getEnv('TG_SECRET_SALT', ''),
  
  // Taco App
  TACO_DOMAIN: getEnv('TACO_DOMAIN', 'tapir'),
  TACO_RITUAL_ID: getEnv('TACO_RITUAL_ID', 27, (v) => parseInt(v, 10)),
  BOT_USER_NAME: getEnv('BOT_USER_NAME', ''),
  
  // API and Services
  API_BASE_URL: getEnv('API_BASE_URL', ''),
  RPC_PROVIDER_URL: getEnv('RPC_PROVIDER_URL', ''),
  
  // Analytics
  OPENREPLAY_PROJECT_KEY: getEnv('OPENREPLAY_PROJECT_KEY', ''),
};

export default config;