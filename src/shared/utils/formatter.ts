/* eslint-disable */
import { camelCase, isArray, isObject, transform } from "lodash";

/**
 * Recursively converts all keys in an object from snake_case to camelCase
 * Handles nested objects and arrays
 *
 * @param obj - The object to convert (can be object, array, or primitive)
 * @returns The converted object with camelCase keys
 */
export const toCamelCase = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined || typeof obj !== "object") {
    return obj;
  }

  if (isArray(obj)) {
    return obj.map((item) => toCamelCase(item)) as T;
  }

  if (isObject(obj)) {
    return transform(
      obj,
      (result: any, value: any, key: string) => {
        const camelKey = camelCase(key);
        // Recursively convert nested objects/arrays.
        result[camelKey] = toCamelCase(value);
      },
      {}
    ) as T;
  }

  return obj;
};
