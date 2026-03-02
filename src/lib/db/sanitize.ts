/**
 * Sanitize input to prevent NoSQL injection attacks.
 * Removes any keys starting with $ and nested objects that could be operators.
 */
export function sanitize<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input !== "object") return input;

  if (Array.isArray(input)) {
    return input.map((item) => sanitize(item)) as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    // Block keys starting with $ (MongoDB operators)
    if (key.startsWith("$")) continue;

    // Recursively sanitize nested objects
    if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize a string value to prevent regex injection.
 */
export function sanitizeString(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
