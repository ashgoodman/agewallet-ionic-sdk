import { AgeWallet } from 'agewallet-ionic-sdk';
import { Capacitor } from '@capacitor/core';

// Auto-detected default metadata identifies the demo build to the dev/QA team
// when verifications land on the server.
const platform = Capacitor.getPlatform();
const AUTO_DEFAULT_METADATA =
  platform === 'ios' ? 'Ionic iOS' :
  platform === 'android' ? 'Ionic Android' :
  'Ionic Web';

const ageWallet = new AgeWallet({
  clientId: 'your-client-id',
  redirectUri: 'https://agewallet-sdk-demo.netlify.app/callback',
  endpoints: {
    auth: 'https://app.agewallet.io/user/authorize',
    token: 'https://app.agewallet.io/user/token',
    userinfo: 'https://app.agewallet.io/user/userinfo',
  },
  metadata: AUTO_DEFAULT_METADATA,
});

// DOM Elements
const loadingEl = document.getElementById('loading')!;
const unverifiedView = document.getElementById('unverified-view')!;
const verifiedView = document.getElementById('verified-view')!;
const verifyBtn = document.getElementById('verify-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const customInput = document.getElementById('metadata-custom') as HTMLInputElement;
const autoDefaultDisplay = document.getElementById('auto-default-display')!;
const metadataDisplay = document.getElementById('metadata-display')!;
const customHelp = document.getElementById('metadata-custom-help')!;

autoDefaultDisplay.textContent = AUTO_DEFAULT_METADATA;
customHelp.textContent = `If populated, sent as "${AUTO_DEFAULT_METADATA} | <your text>" for this verification only.`;

async function checkVerification() {
  showLoading(true);
  const isVerified = await ageWallet.isVerified();
  if (isVerified) {
    const md = await ageWallet.getMetadata();
    metadataDisplay.textContent = md ?? '(none)';
  }
  showLoading(false);
  updateUI(isVerified);
}

async function startVerification() {
  verifyBtn.disabled = true;
  showLoading(true);
  try {
    const custom = customInput.value.trim();
    const override = custom.length > 0 ? `${AUTO_DEFAULT_METADATA} | ${custom}` : undefined;
    console.log('[demo] awaiting ageWallet.startVerification...');
    const result = await ageWallet.startVerification({ metadata: override });
    console.log('[demo] ageWallet.startVerification resolved: ' + result);
    const verified = result === 'success';
    if (verified) {
      const md = await ageWallet.getMetadata();
      metadataDisplay.textContent = md ?? '(none)';
    }
    updateUI(verified);
    if (result === 'denied') {
      alert('Age verification was cancelled.');
    } else if (result === 'failed') {
      alert('Verification could not be completed. Please try again.');
    }
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.includes('metadata')) {
      alert(`Invalid metadata: ${error.message}`);
    } else {
      console.error('Verification failed:', error);
    }
    updateUI(false);
  } finally {
    verifyBtn.disabled = false;
  }
}

async function clearVerification() {
  await ageWallet.clearVerification();
  metadataDisplay.textContent = '(none)';
  updateUI(false);
}

function showLoading(show: boolean) {
  loadingEl.classList.toggle('show', show);
  if (show) {
    unverifiedView.classList.remove('show');
    verifiedView.classList.remove('show');
  }
}

function updateUI(isVerified: boolean) {
  loadingEl.classList.remove('show');
  unverifiedView.classList.toggle('show', !isVerified);
  verifiedView.classList.toggle('show', isVerified);
}

verifyBtn.addEventListener('click', startVerification);
clearBtn.addEventListener('click', clearVerification);

checkVerification();
