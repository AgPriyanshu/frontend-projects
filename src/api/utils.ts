import { toCamelCase } from "shared/utils";

/**
 * Type-safe wrapper for converting API responses to camelCase
 * Use this with your API response types
 *
 * @param response - The API response to convert
 * @returns The converted response with proper typing
 */
export const apiResponseMapper = <T>(response: unknown): T => {
  return toCamelCase<T>(response);
};
