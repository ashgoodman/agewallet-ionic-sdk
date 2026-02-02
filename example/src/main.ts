import { AgeWallet } from 'agewallet-ionic-sdk';

// Initialize SDK
const ageWallet = new AgeWallet({
  clientId: 'your-client-id',
  redirectUri: 'https://agewallet-sdk-demo.netlify.app/callback',
});

// DOM Elements
const loadingEl = document.getElementById('loading')!;
const unverifiedView = document.getElementById('unverified-view')!;
const verifiedView = document.getElementById('verified-view')!;
const verifyBtn = document.getElementById('verify-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;

// Check verification status on load
async function checkVerification() {
  showLoading(true);
  const isVerified = await ageWallet.isVerified();
  showLoading(false);
  updateUI(isVerified);
}

// Start verification flow
async function startVerification() {
  verifyBtn.disabled = true;
  try {
    await ageWallet.startVerification();
    const isVerified = await ageWallet.isVerified();
    updateUI(isVerified);
  } catch (error) {
    console.error('Verification failed:', error);
    alert('Verification failed. Please try again.');
  } finally {
    verifyBtn.disabled = false;
  }
}

// Clear verification
async function clearVerification() {
  await ageWallet.clearVerification();
  updateUI(false);
}

// UI Helpers
function showLoading(show: boolean) {
  loadingEl.classList.toggle('show', show);
  unverifiedView.classList.toggle('show', false);
  verifiedView.classList.toggle('show', false);
}

function updateUI(isVerified: boolean) {
  loadingEl.classList.toggle('show', false);
  unverifiedView.classList.toggle('show', !isVerified);
  verifiedView.classList.toggle('show', isVerified);
}

// Event Listeners
verifyBtn.addEventListener('click', startVerification);
clearBtn.addEventListener('click', clearVerification);

// Initialize
checkVerification();
