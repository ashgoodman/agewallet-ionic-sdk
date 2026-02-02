# AgeWallet Ionic SDK Demo

A minimal Capacitor demo app showing the AgeWallet Ionic SDK in action.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the web app:
   ```bash
   npm run build
   ```

3. Add native platforms:
   ```bash
   npm run cap:add:android
   npm run cap:add:ios
   ```

4. Sync native projects:
   ```bash
   npm run cap:sync
   ```

## Configuration

Before testing, update `src/main.ts` with your actual AgeWallet client ID:

```typescript
const ageWallet = new AgeWallet({
  clientId: 'your-actual-client-id',  // Replace this
  redirectUri: 'https://agewallet-sdk-demo.netlify.app/callback',
});
```

## Running

### Web (for development)
```bash
npm run start
```

### Android
```bash
npx cap open android
```
Then run from Android Studio.

### iOS
```bash
npx cap open ios
```
Then run from Xcode.

## Deep Link Configuration

After adding platforms, configure deep links in the native projects:

### Android
Add to `android/app/src/main/AndroidManifest.xml` inside `<activity>`:
```xml
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="https" android:host="agewallet-sdk-demo.netlify.app" android:pathPrefix="/callback" />
</intent-filter>
```

### iOS
Add associated domains in Xcode: `applinks:agewallet-sdk-demo.netlify.app`
