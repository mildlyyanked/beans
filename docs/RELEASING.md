# Releasing Tavern for Android

The `Android` workflow (`.github/workflows/android.yml`) does everything from a clean checkout: web build → Capacitor sync → Gradle → APK/AAB → GitHub Release → Google Play.

## What runs when

| Trigger | Result |
| --- | --- |
| Any push or PR | Typecheck, tests, SRD check, then an APK. With release secrets: release-signed APK + AAB. Without: a debug-signed APK. Both are sideloadable and appear under the run's **Artifacts**. |
| Tag `v1.2.3` | Same build with `versionName=1.2.3`, attached to a GitHub Release, and the AAB is uploaded to the Play **internal** track. |
| **Run workflow** button | Tick *publish* to update the rolling `nightly` pre-release; its `tavern-nightly.apk` link is permanent; choose a Play track and tick *deploy* to push the current commit to Play. |

`versionCode` is the commit count on the branch, so it only ever increases. `versionName` comes from the tag.

## One-time setup

### 1. Signing key (required for Play, recommended for sideload builds)

Generate a keystore once and keep it safe — losing it means you can never update the Play listing again.

```bash
keytool -genkeypair -v -keystore tavern-release.keystore -alias tavern \
  -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 tavern-release.keystore > keystore.b64   # macOS: base64 -i tavern-release.keystore
```

Add these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | contents of `keystore.b64` |
| `ANDROID_KEYSTORE_PASSWORD` | the keystore password |
| `ANDROID_KEY_ALIAS` | `tavern` (or whatever you chose) |
| `ANDROID_KEY_PASSWORD` | the key password |

Play uses **Play App Signing**: your upload key above signs the AAB, Google re-signs for distribution. Enroll when you create the app in Play Console.

### 2. Google Play service account (for automatic uploads)

1. Google Cloud Console → create a service account (any project) → create a **JSON key**.
2. Play Console → **Users and permissions** → invite the service account's email. Grant *Release to testing tracks* (and *Release to production* if you want tag pushes to go all the way) for the Tavern app.
3. Add the JSON file's full contents as the secret `PLAY_SERVICE_ACCOUNT_JSON`.
4. Optional but recommended: create a GitHub **environment** named `google-play` with required reviewers, so Play uploads wait for approval.

### 3. First upload must be manual

Play's API refuses to create a brand-new app. Create the app in Play Console, fill in the store listing, then upload the first AAB by hand (download it from a workflow run's artifacts). Every subsequent release can go through the workflow.

### 4. Package name

`app.tavern.dm` is set in three places and must match your Play listing: `capacitor.config.ts`, `android/app/build.gradle` (`applicationId` and `namespace`), and `PACKAGE_NAME` in the workflow. Change all three *before* the first Play upload; it is permanent afterwards.

## Cutting a release

```bash
git tag v0.1.0
git push origin v0.1.0
```

Watch the **Actions** tab. When it finishes: the GitHub Release has `tavern-0.1.0.apk` (sideload) and `tavern-0.1.0.aab`, and Play's internal track has the new build. Promote it to production from Play Console, or re-run the workflow with *Run workflow → track: production*.

## Local native builds

```bash
npm run build && npx cap sync android
npx cap open android            # Android Studio
# or headless:
cd android && ./gradlew assembleDebug && ls app/build/outputs/apk/debug/
```

Icons and splash screens are generated from `assets/` with `npx capacitor-assets generate --android`; regenerate `assets/` from `public/icon.svg` with `npm run native:assets`.
