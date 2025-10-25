export function sanitizeUrl(
  input: string,
  fallback: string = "https://defillama.com"
): string {
  try {
    const url = new URL(input);
    // Only allow https protocol and defillama.com domain
    if (url.protocol === "https:" && url.hostname === "defillama.com") {
      let urlString = url.toString();
      // Remove trailing slash for cleaner URLs
      if (urlString.endsWith("/")) {
        urlString = urlString.slice(0, -1);
      }
      return urlString;
    }
    return fallback;
  } catch {
    // Invalid URL, return fallback
    return fallback;
  }
}

export function sanitizeText(
  input: string | null | undefined,
  maxLength: number = 200
): string | null {
  // Return null for null, undefined, or empty string
  if (input == null || input === "") {
    return null;
  }
  // Truncate to max length
  const truncated = input.slice(0, maxLength);
  // Remove any potentially dangerous characters (control characters, etc.)
  const sanitized = truncated.replace(/[\x00-\x1F\x7F]/g, "");
  // Return null if sanitization resulted in empty string
  return sanitized === "" ? null : sanitized;
}

export function sanitizeImageUrl(
  input: string | null | undefined
): string | null {
  // Return null for null, undefined, or empty string
  if (input == null || input === "") {
    return null;
  }

  try {
    const url = new URL(input);
    // Only allow https protocol and icons.llamao.fi domain
    if (url.protocol === "https:" && url.hostname === "icons.llamao.fi") {
      return url.toString();
    }
    return null;
  } catch {
    // Invalid URL, return null
    return null;
  }
}
