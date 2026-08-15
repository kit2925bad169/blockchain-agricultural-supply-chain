export const LETTERS_SPACES_PATTERN = /^[\p{L}][\p{L}\s.'’,-]*$/u;
export const LOCATION_PATTERN = /^[\p{L}][\p{L}\s.'’,-]*(?:,\s*[\p{L}][\p{L}\s.'’,-]*)*$/u;
export const QUANTITY_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d{1,3})?$/;

export function isName(value: string) {
  return LETTERS_SPACES_PATTERN.test(value.trim());
}

export function isLocation(value: string) {
  return LOCATION_PATTERN.test(value.trim());
}

export function isQuantity(value: string) {
  return QUANTITY_PATTERN.test(value.trim());
}

export function cleanName(value: string) {
  return value.replace(/[^\p{L}\s.'’,-]/gu, '');
}

export function cleanLocation(value: string) {
  return value.replace(/[^\p{L}\s.'’,-]/gu, '');
}

export function cleanQuantity(value: string) {
  return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
}

/**
 * Builds the URL encoded in every product QR code.
 *
 * For a deployed site, set VITE_PUBLIC_APP_URL to the public HTTPS URL
 * (for example: https://your-project.vercel.app).
 *
 * When VITE_PUBLIC_APP_URL is not set, the current browser origin is used.
 */
export function buildTraceUrl(token: string) {
  const configuredBase =
    (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)?.trim();

  if (!configuredBase) {
    throw new Error(
      'VITE_PUBLIC_APP_URL is missing. Add the public website URL to your .env file.'
    );
  }

  const url = new URL(configuredBase);
  url.searchParams.set('track', token);

  return url.toString();
}
