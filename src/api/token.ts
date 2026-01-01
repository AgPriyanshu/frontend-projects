/**
 * Token storage utilities for managing access and refresh tokens
 */

import { LocalStorageManager } from 'shared/local-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

/**
 * Get the access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return LocalStorageManager.getItem<string>(ACCESS_TOKEN_KEY);
};

/**
 * Get the refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return LocalStorageManager.getItem<string>(REFRESH_TOKEN_KEY);
};

/**
 * Store both access and refresh tokens
 */
export const setTokens = (accessToken: string, refreshToken: string): void => {
  LocalStorageManager.setItem(ACCESS_TOKEN_KEY, accessToken);
  LocalStorageManager.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Clear all tokens from localStorage
 */
export const clearTokens = (): void => {
  LocalStorageManager.removeItem(ACCESS_TOKEN_KEY);
  LocalStorageManager.removeItem(REFRESH_TOKEN_KEY);
};


