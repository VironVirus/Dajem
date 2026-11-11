# DAJEM Android & iPhone App — Hostinger Push-to-Deploy Architecture

This guide explains how the **DAJEM Group Android & iOS mobile app** embodies the 3 subsidiary apps (**DAJEM Orbital**, **DAJEM Homes**, and **DAJEM Farms**) while automatically receiving live updates every time you commit and deploy to **Hostinger**—without waiting for Apple App Store or Google Play Store review.

---

## 1. How Instant Hostinger-to-Mobile Sync Works

Instead of maintaining three separate codebases (Web, Swift/iOS, Kotlin/Android) that require manual App Store resubmissions for every UI, pricing, or feature change, DAJEM uses a **Capacitor Hybrid Native Shell + Remote Hostinger Server (`capacitor.config.json`)**:

```
[Git Commit & Push] ──► [Hostinger Next.js Build] ──► [Live on Android & iPhone Apps Instantly]
```

1. **Single Unified Codebase (`apps/landing` + `packages/ui`)**:
   - All 3 subsidiary experiences (`Orbital` Survey Plan CAD app, `Homes` Property Listing app, `Farms` E-Commerce app) and the shared `DajemProvider` state live in the unified Next.js codebase.
2. **Hostinger Git Auto-Deploy**:
   - Hostinger builds and serves `apps/landing` at your production domain (`https://dajemgroup.com`).
3. **Capacitor Native Wrapper (`capacitor.config.json`)**:
   - The iOS (`.ipa`) and Android (`.apk` / `.aab`) binaries wrap a hardware-accelerated native WebView pointed at `server.url` (`https://dajemgroup.com`) with native bridges for:
     - **GPS & Geolocation** (for DAJEM Orbital parcel coordinate capture)
     - **Camera & Document Picker** (for Survey deeds/COOs and Home owner photo uploads)
     - **Native Share & Haptics** (for sharing property listings and survey tracking links)
     - **Flutterwave In-App Checkout** (`allowNavigation` whitelisted for `*.flutterwave.com`)

---

## 2. What Updates Instantly via Hostinger vs. App Store Rebuild

| Change Type | How to Deploy | Appears in Mobile Apps |
| :--- | :--- | :--- |
| **UI/UX layouts, colors, navigation, new pages** | `git push` to Hostinger | **Instantly (0 mins review)** |
| **Survey Fee Calculator rates & city zones** | `git push` or Admin Portal | **Instantly** |
| **Farms products, Flash Promos, Chicken Cut prices** | Admin Portal or `git push` | **Instantly** |
| **Homes property listings, bids, statuses** | Admin Portal or `git push` | **Instantly** |
| **Changing App Icon, Splash Screen, or Native OS Permissions** | Rebuild Xcode / Android Studio | Requires Store Update |

---

## 3. Building the Android & iPhone Shells (One-Time Setup)

A pre-configured [`capacitor.config.json`](../capacitor.config.json) is included at the repository root.

### Step 1: Install Capacitor CLI & Platforms
```bash
npm install -D @capacitor/cli
npm install @capacitor/core @capacitor/ios @capacitor/android @capacitor/status-bar @capacitor/splash-screen
```

### Step 2: Set Your Production Hostinger Domain
In [`capacitor.config.json`](../capacitor.config.json), `server.url` points directly to the unified Option 1 mobile-styled DAJEM web application:
```json
{
  "appId": "com.dajemgroup.app",
  "appName": "DAJEM Group",
  "server": {
    "url": "https://dajemgroup.com/?v=1.0.2&vc=102",
    "cleartext": false
  }
}
```

### Step 3: Convenient Mobile Scripts
Root `package.json` now includes dedicated shortcuts:
```bash
# Add native platforms (first time)
npm run mobile:add:ios
npm run mobile:add:android

# Sync changes to native projects
npm run mobile:sync

# Open projects in Xcode or Android Studio
npm run mobile:ios
npm run mobile:android

# Full build and sync
npm run mobile:build
```

### Step 4: Compile Once to Google Play & Apple App Store
- **Android**: Run `npm run mobile:android` → Build Signed Bundle / APK in Android Studio.
- **iPhone (iOS)**: Run `npm run mobile:ios` → Archive & Upload to TestFlight / App Store Connect in Xcode.

Once installed on any Android or iPhone device, **every future commit deployed to Hostinger immediately updates the mobile app**.

---

## 4. Direct Android APK Download Link & Web Portal

The compiled Android application package is hosted directly on your website for instant phone downloads:

* **Direct APK Download URL**: `https://dajemgroup.com/downloads/dajem-app.apk`
* **Download Portal Page**: `https://dajemgroup.com/download`
* **Physical File Location**: `apps/landing/public/downloads/dajem-app.apk`

### Installing on Any Android Phone:
1. Open `https://dajemgroup.com/download` in your mobile browser.
2. Tap **Download Android APK**.
3. If prompted with *"File might be harmful"*, tap **Download anyway** (standard for non-Google Play direct APK installations).
4. Tap the downloaded file in your notification bar and select **Install**.

---

## 5. In-App Update Engine (Dual-Layer Updates)

DAJEM Mobile employs a **dual-layer update architecture**:

1. **Instant Web/Content Updates (0 Download Required)**:
   - Any layout changes, new listings, price adjustments, or survey fees committed to Hostinger update **instantly** inside the app via Capacitor Remote URL.
2. **Native APK Updates (Automatic In-App Download)**:
   - When a new native version is built, the app calls `GET /api/app/version` and compares `versionCode` against the installed native build.
   - If a newer native APK is available, a prominent **Update Banner** displays at the top of the app.
   - Tapping the banner opens the **DAJEM Android Updater Modal**, which displays the changelog and downloads the new APK package via Android's native `DownloadManager` (`MainActivity.java`) for one-tap installation.
   - Users can also manually check at any time from **Ecosystem ▸ Check for App Updates**.

