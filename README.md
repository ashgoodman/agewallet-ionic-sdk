# AgeWallet Ionic SDK

Age verification SDK for Ionic/Capacitor applications using AgeWallet.

Works with **Ionic Angular**, **Ionic React**, **Ionic Vue**, and any **Capacitor** app.

## Installation

```bash
npm install agewallet-ionic-sdk
```

### Required Capacitor Plugins

```bash
npm install @capacitor/app @capacitor/browser @capacitor/preferences
npx cap sync
```

## Platform Setup

### Android

Add the following to your `AndroidManifest.xml` inside the `<activity>` tag:

```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="yourapp.com" android:pathPrefix="/callback" />
</intent-filter>
```

Host the `assetlinks.json` file at `https://yourapp.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.yourcompany.yourapp",
      "sha256_cert_fingerprints": ["YOUR_SHA256_FINGERPRINT"]
    }
  }
]
```

### iOS

Add associated domains to your app's entitlements in Xcode:

```
applinks:yourapp.com
```

Host the `apple-app-site-association` file at `https://yourapp.com/.well-known/apple-app-site-association`:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAMID.com.yourcompany.yourapp",
        "paths": ["/callback", "/callback/*"]
      }
    ]
  }
}
```

## Usage

### Basic Usage

```typescript
import { AgeWallet } from 'agewallet-ionic-sdk';

// Initialize the SDK
const ageWallet = new AgeWallet({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/callback',
});

// Check if user is verified
const isVerified = await ageWallet.isVerified();

if (!isVerified) {
  // Start verification flow
  await ageWallet.startVerification();
}
```

### Ionic Angular Example

```typescript
import { Component, OnInit } from '@angular/core';
import { AgeWallet } from 'agewallet-ionic-sdk';

@Component({
  selector: 'app-home',
  template: `
    <ion-content>
      <div *ngIf="!isVerified">
        <h1>Age Verification Required</h1>
        <ion-button (click)="verify()">Verify with AgeWallet</ion-button>
      </div>
      <div *ngIf="isVerified">
        <h1>Welcome!</h1>
        <ion-button (click)="logout()">Logout</ion-button>
      </div>
    </ion-content>
  `,
})
export class HomePage implements OnInit {
  isVerified = false;
  private ageWallet: AgeWallet;

  constructor() {
    this.ageWallet = new AgeWallet({
      clientId: 'your-client-id',
      redirectUri: 'https://yourapp.com/callback',
    });
  }

  async ngOnInit() {
    this.isVerified = await this.ageWallet.isVerified();
  }

  async verify() {
    await this.ageWallet.startVerification();
    this.isVerified = await this.ageWallet.isVerified();
  }

  async logout() {
    await this.ageWallet.clearVerification();
    this.isVerified = false;
  }
}
```

### Ionic React Example

```tsx
import { useState, useEffect } from 'react';
import { IonButton, IonContent } from '@ionic/react';
import { AgeWallet } from 'agewallet-ionic-sdk';

const ageWallet = new AgeWallet({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/callback',
});

export const HomePage: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    ageWallet.isVerified().then(setIsVerified);
  }, []);

  const verify = async () => {
    await ageWallet.startVerification();
    setIsVerified(await ageWallet.isVerified());
  };

  const logout = async () => {
    await ageWallet.clearVerification();
    setIsVerified(false);
  };

  return (
    <IonContent>
      {!isVerified ? (
        <>
          <h1>Age Verification Required</h1>
          <IonButton onClick={verify}>Verify with AgeWallet</IonButton>
        </>
      ) : (
        <>
          <h1>Welcome!</h1>
          <IonButton onClick={logout}>Logout</IonButton>
        </>
      )}
    </IonContent>
  );
};
```

## Configuration

### AgeWallet Dashboard Setup

1. Register your app on the [AgeWallet Dashboard](https://app.agewallet.io)
2. Create a **public client** (no client secret)
3. Set your redirect URI to your app's universal link (e.g., `https://yourapp.com/callback`)

### Custom Endpoints

For development/staging environments:

```typescript
const ageWallet = new AgeWallet({
  clientId: 'your-client-id',
  redirectUri: 'https://yourapp.com/callback',
  endpoints: {
    auth: 'https://dev.agewallet.io/user/authorize',
    token: 'https://dev.agewallet.io/user/token',
    userinfo: 'https://dev.agewallet.io/user/userinfo',
  },
});
```

## API Reference

### `AgeWallet`

#### Constructor

```typescript
new AgeWallet(config: AgeWalletConfig)
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `clientId` | string | Yes | Your client ID from AgeWallet dashboard |
| `redirectUri` | string | Yes | Your app's universal link callback URL |
| `endpoints` | AgeWalletEndpoints | No | Override default API endpoints |

#### Methods

##### `isVerified()`

```typescript
isVerified(): Promise<boolean>
```

Checks if the user is currently verified. Returns `true` if verified and not expired, `false` otherwise.

##### `startVerification()`

```typescript
startVerification(): Promise<void>
```

Starts the verification flow. Opens the system browser to the AgeWallet authorization page. The callback is handled automatically via deep linking.

##### `handleCallback(url)`

```typescript
handleCallback(url: string): Promise<boolean>
```

Manually handles a callback URL. Usually not needed as deep links are handled automatically. Returns `true` if verification succeeded, `false` otherwise.

##### `clearVerification()`

```typescript
clearVerification(): Promise<void>
```

Clears the stored verification state (logout).

## Security

- This SDK is for **public clients only** (no client secret)
- Uses **PKCE (S256)** for secure authorization code exchange
- Tokens are stored using Capacitor Preferences
- State parameter provides CSRF protection
- Nonce parameter provides replay protection

## Regional Exemptions

Some regions don't require age verification. When a user is in an exempt region, the SDK automatically grants a 24-hour synthetic verification, so `isVerified()` returns `true`.

## License

MIT
