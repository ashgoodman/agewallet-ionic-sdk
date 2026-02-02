import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import type { AgeWalletConfig, VerificationState } from './types';
import { DEFAULT_ENDPOINTS } from './types';
import {
  generateVerifier,
  generateChallenge,
  generateState,
  generateNonce,
} from './security';
import {
  getVerification,
  setVerification,
  clearVerification,
  getOidcState,
  setOidcState,
  clearOidcState,
} from './storage';

/**
 * AgeWallet SDK for Ionic/Capacitor applications.
 *
 * Provides age verification via OIDC/PKCE flow.
 *
 * @example
 * ```typescript
 * import { AgeWallet } from 'agewallet-ionic-sdk';
 *
 * const ageWallet = new AgeWallet({
 *   clientId: 'your-client-id',
 *   redirectUri: 'https://yourapp.com/callback',
 * });
 *
 * if (!await ageWallet.isVerified()) {
 *   await ageWallet.startVerification();
 * }
 * ```
 */
export class AgeWallet {
  private config: AgeWalletConfig;
  private authEndpoint: string;
  private tokenEndpoint: string;
  private userinfoEndpoint: string;
  private listenerHandle: Promise<{ remove: () => void }> | null = null;

  constructor(config: AgeWalletConfig) {
    if (!config.clientId) {
      throw new Error('[AgeWallet] Missing clientId');
    }
    if (!config.redirectUri) {
      throw new Error('[AgeWallet] Missing redirectUri');
    }

    this.config = config;
    this.authEndpoint = config.endpoints?.auth ?? DEFAULT_ENDPOINTS.auth;
    this.tokenEndpoint = config.endpoints?.token ?? DEFAULT_ENDPOINTS.token;
    this.userinfoEndpoint = config.endpoints?.userinfo ?? DEFAULT_ENDPOINTS.userinfo;
  }

  /**
   * Check if the user is currently verified.
   * Returns true if verified and not expired, false otherwise.
   */
  async isVerified(): Promise<boolean> {
    const state = await getVerification();
    return state?.isVerified ?? false;
  }

  /**
   * Start the verification flow.
   * Opens the system browser to the AgeWallet authorization page.
   */
  async startVerification(): Promise<void> {
    // Generate PKCE parameters
    const verifier = generateVerifier();
    const challenge = await generateChallenge(verifier);
    const state = generateState();
    const nonce = generateNonce();

    // Store OIDC state for callback validation
    await setOidcState({ state, verifier, nonce });

    // Set up deep link listener before opening browser
    this.setupDeepLinkListener();

    // Build authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'openid age',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      nonce: nonce,
    });

    const authUrl = `${this.authEndpoint}?${params.toString()}`;

    // Open browser
    await Browser.open({ url: authUrl });
  }

  /**
   * Set up listener for deep link callbacks.
   */
  private setupDeepLinkListener(): void {
    this.listenerHandle = App.addListener('appUrlOpen', async (event) => {
      const url = event.url;

      // Check if this is our callback URL
      if (url.startsWith(this.config.redirectUri)) {
        // Close browser
        await Browser.close();

        // Handle the callback
        await this.handleCallback(url);

        // Remove listener
        if (this.listenerHandle) {
          (await this.listenerHandle).remove();
          this.listenerHandle = null;
        }
      }
    });
  }

  /**
   * Handle callback URL from authorization.
   * Returns true if verification succeeded, false otherwise.
   */
  async handleCallback(url: string): Promise<boolean> {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    // Handle error response
    if (error) {
      console.error(`[AgeWallet] Authorization error: ${error} - ${errorDescription}`);
      await clearOidcState();
      return false;
    }

    // Validate required parameters
    if (!code || !state) {
      console.error('[AgeWallet] Missing code or state in callback');
      await clearOidcState();
      return false;
    }

    // Validate state matches stored state
    const storedOidc = await getOidcState();
    if (!storedOidc || storedOidc.state !== state) {
      console.error('[AgeWallet] Invalid state or session expired');
      await clearOidcState();
      return false;
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCode(code, storedOidc.verifier);
      if (!tokenResponse) {
        await clearOidcState();
        return false;
      }

      // Fetch user info to verify age claim
      const userInfo = await this.fetchUserInfo(tokenResponse.access_token);
      if (!userInfo) {
        await clearOidcState();
        return false;
      }

      // Check age_verified claim
      if (!userInfo.age_verified) {
        console.error('[AgeWallet] Age verification failed');
        await clearOidcState();
        return false;
      }

      // Calculate expiry
      const expiresIn = tokenResponse.expires_in ?? 3600;
      const expiresAt = Date.now() + expiresIn * 1000;

      // Store verification state
      await setVerification({
        accessToken: tokenResponse.access_token,
        expiresAt,
        isVerified: true,
      });

      await clearOidcState();
      return true;
    } catch (e) {
      console.error('[AgeWallet] Error during token exchange:', e);
      await clearOidcState();
      return false;
    }
  }

  /**
   * Exchange authorization code for tokens.
   */
  private async exchangeCode(
    code: string,
    verifier: string
  ): Promise<{ access_token: string; expires_in?: number } | null> {
    try {
      const response = await fetch(this.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.config.clientId,
          redirect_uri: this.config.redirectUri,
          code,
          code_verifier: verifier,
        }),
      });

      if (!response.ok) {
        console.error('[AgeWallet] Token exchange failed:', response.status);
        return null;
      }

      return await response.json();
    } catch (e) {
      console.error('[AgeWallet] Token exchange error:', e);
      return null;
    }
  }

  /**
   * Fetch user info from the userinfo endpoint.
   */
  private async fetchUserInfo(
    accessToken: string
  ): Promise<{ age_verified?: boolean } | null> {
    try {
      const response = await fetch(this.userinfoEndpoint, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('[AgeWallet] UserInfo fetch failed:', response.status);
        return null;
      }

      return await response.json();
    } catch (e) {
      console.error('[AgeWallet] UserInfo fetch error:', e);
      return null;
    }
  }

  /**
   * Clear all verification state (logout).
   */
  async clearVerification(): Promise<void> {
    await clearVerification();
    await clearOidcState();
  }
}
