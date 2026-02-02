/**
 * Configuration for AgeWallet SDK.
 */
export interface AgeWalletConfig {
  /** Your client ID from the AgeWallet dashboard */
  clientId: string;
  /** Your app's universal link callback URL */
  redirectUri: string;
  /** Optional custom endpoint configuration */
  endpoints?: AgeWalletEndpoints;
}

/**
 * Custom endpoint configuration.
 */
export interface AgeWalletEndpoints {
  auth?: string;
  token?: string;
  userinfo?: string;
}

/**
 * Stored verification state.
 */
export interface VerificationState {
  accessToken: string;
  expiresAt: number;
  isVerified: boolean;
}

/**
 * OIDC state stored during authorization flow.
 */
export interface OidcState {
  state: string;
  verifier: string;
  nonce: string;
}

/**
 * Default endpoints.
 */
export const DEFAULT_ENDPOINTS = {
  auth: 'https://app.agewallet.io/user/authorize',
  token: 'https://app.agewallet.io/user/token',
  userinfo: 'https://app.agewallet.io/user/userinfo',
};
