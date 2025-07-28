import type { ApiResponse } from "./types";
import { Formatter } from "@/utils";

/**
 * Maps an API response by converting the keys of the `data` property from snake_case to camelCase.
 *
 * @template R - The expected type of the mapped `data` property after conversion.
 * @template P - The original type of the `data` property in the API response.
 * @param response - The original API response object containing data in snake_case.
 * @returns A new API response object with the `data` property keys converted to camelCase.
 */
export const apiResponseMapper = <R = any, P = any>(
  response: ApiResponse<P>
): ApiResponse<R> => ({
  ...response,
  data: Formatter.convertKeysSnakeToCamelCase<R>(response.data),
});

/**
 * Maps the keys of the given payload object from camelCase to snake_case.
 *
 * @template R - The return type after mapping the keys.
 * @template P - The type of the input payload.
 * @param payload - The input object whose keys are to be converted.
 * @returns The payload object with keys converted to snake_case.
 */
export const apiPayloadMapper = <R = any, P = any>(payload: P): R =>
  Formatter.convertKeysCamelToSnakeCase<R>(payload);
