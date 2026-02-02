/**
 * Security utilities for PKCE and state generation.
 */

/**
 * Generate a cryptographically secure PKCE verifier.
 * Returns a base64-URL encoded string of 64 random bytes.
 */
export function generateVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate a PKCE challenge from a verifier using S256 method.
 * Returns SHA256(verifier) as base64-URL encoded string.
 */
export async function generateChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Generate a random state parameter for CSRF protection.
 * Returns a 32-character hex string.
 */
export function generateState(): string {
  return generateRandomHex(16);
}

/**
 * Generate a random nonce for replay protection.
 * Returns a 32-character hex string.
 */
export function generateNonce(): string {
  return generateRandomHex(16);
}

/**
 * Generate a random hex string of specified byte length.
 */
function generateRandomHex(byteLength: number): string {
  const array = new Uint8Array(byteLength);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Base64-URL encode bytes without padding.
 */
function base64UrlEncode(bytes: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
