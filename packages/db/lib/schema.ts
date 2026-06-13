/** Collect string enum values for Mongoose `enum` validators. */
export function enumValues<T extends Record<string, string>>(
  enumObject: T,
): Array<T[keyof T]> {
  return Object.values(enumObject) as Array<T[keyof T]>
}
