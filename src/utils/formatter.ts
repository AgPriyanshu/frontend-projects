import {
  camelCase,
  isArray,
  isPlainObject,
  mapKeys,
  mapValues,
  snakeCase,
} from "lodash";

export const Formatter = {
  /**
   * Recursively converts keys of an object from snake_case to camelCase.
   * @param obj - The input object or array.
   * @returns A new object or array with camelCased keys.
   */
  convertKeysSnakeToCamelCase: function convertKeysSnakeToCamelCase<ReturnType>(
    obj: any
  ): ReturnType {
    if (isArray(obj)) {
      return obj.map(convertKeysSnakeToCamelCase) as unknown as ReturnType;
    } else if (isPlainObject(obj)) {
      const camelCased = mapValues(
        mapKeys(obj, (_value, key) => camelCase(key)),
        (value) => convertKeysSnakeToCamelCase(value)
      );
      return camelCased as unknown as ReturnType;
    }
    return obj as ReturnType;
  },

  /**
   * Recursively converts keys of an object from snake_case to camelCase.
   * @param obj - The input object or array.
   * @returns A new object or array with camelCased keys.
   */
  convertKeysCamelToSnakeCase: function convertKeysCamelToSnakeCase<ReturnType>(
    obj: any
  ): ReturnType {
    if (isArray(obj)) {
      return obj.map(convertKeysCamelToSnakeCase) as unknown as ReturnType;
    } else if (isPlainObject(obj)) {
      const camelCased = mapValues(
        mapKeys(obj, (_value, key) => snakeCase(key)),
        (value) => convertKeysCamelToSnakeCase(value)
      );
      return camelCased as unknown as ReturnType;
    }
    return obj as ReturnType;
  },
};
