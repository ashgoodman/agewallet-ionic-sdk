import { Preferences } from '@capacitor/preferences';
import type { VerificationState, OidcState } from './types';

const VERIFICATION_KEY = 'io.agewallet.sdk.verification';
const OIDC_KEY = 'io.agewallet.sdk.oidc';

/**
 * Get stored verification state.
 */
export async function getVerification(): Promise<VerificationState | null> {
  const { value } = await Preferences.get({ key: VERIFICATION_KEY });
  if (!value) return null;

  try {
    const state = JSON.parse(value) as VerificationState;

    // Auto-clear if expired
    if (Date.now() >= state.expiresAt) {
      await clearVerification();
      return null;
    }

    return state;
  } catch {
    await clearVerification();
    return null;
  }
}

/**
 * Store verification state.
 */
export async function setVerification(state: VerificationState): Promise<void> {
  await Preferences.set({
    key: VERIFICATION_KEY,
    value: JSON.stringify(state),
  });
}

/**
 * Clear verification state.
 */
export async function clearVerification(): Promise<void> {
  await Preferences.remove({ key: VERIFICATION_KEY });
}

/**
 * Get stored OIDC state (during auth flow).
 */
export async function getOidcState(): Promise<OidcState | null> {
  const { value } = await Preferences.get({ key: OIDC_KEY });
  if (!value) return null;

  try {
    return JSON.parse(value) as OidcState;
  } catch {
    await clearOidcState();
    return null;
  }
}

/**
 * Store OIDC state (during auth flow).
 */
export async function setOidcState(state: OidcState): Promise<void> {
  await Preferences.set({
    key: OIDC_KEY,
    value: JSON.stringify(state),
  });
}

/**
 * Clear OIDC state.
 */
export async function clearOidcState(): Promise<void> {
  await Preferences.remove({ key: OIDC_KEY });
}
