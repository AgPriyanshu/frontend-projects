import { LocalStorageKeys } from "./constants";
import { LocalStorageManager } from "./local-storage-manager";

/**
 * Get the access token from localStorage
 */
export const getAccessToken = (): string | null => {
  return LocalStorageManager.getItem<string>(LocalStorageKeys.ACCESS_TOKEN);
};

/**
 * Store both access and refresh token
 */
export const setAccessToken = (accessToken: string): void => {
  LocalStorageManager.setItem(LocalStorageKeys.ACCESS_TOKEN, accessToken);
};

/**
 * Clear all token from localStorage
 */
export const clearToken = (): void => {
  LocalStorageManager.removeItem(LocalStorageKeys.ACCESS_TOKEN);
};
