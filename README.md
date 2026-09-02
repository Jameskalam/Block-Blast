# Blockmint — Developer Setup Guide

A React Native (Expo SDK 52) block-puzzle game for Android.

This guide takes a new machine from nothing to the app running on a phone.
**Follow the steps in order.** Section 7 lists the traps that have already cost
this project days of debugging — read it before you file a bug.

---

## 1. Tech stack

| Component | Version | Notes |
|---|---|---|
| Expo SDK | 52 | `expo@~52.0.0` |
| React Native | 0.76.9 | Pinned exactly — do not bump casually |
| React | 18.3.1 | |
| Node.js | 20 LTS or 22 LTS | 24 works but is newer than Expo 52 targets |
| JDK | **17** | Mandatory. 21/24/25 will NOT work |
| Android compileSdk | 35 | |
| Android targetSdk | 34 | |
| Android minSdk | 24 | RN 0.76 native libs are built for API 24 |
| Build Tools | 35.0.0 | |
| NDK | 26.1.10909125 | Exact version required |
| Gradle | 8.10.2 | Provided by the wrapper — don't install manually |

---

## 2. Prerequisites

### 2.1 Node.js

Install Node **20 LTS** or **22 LTS** from <https://nodejs.org>.

```bash
node -v    # v20.x or v22.x
npm -v
```

### 2.2 JDK 17 — the most common source of failure

Gradle and the Android Gradle Plugin require **JDK 17**. A newer system JDK is
the single most frequent cause of a broken build here.

Install Eclipse Temurin JDK 17: <https://adoptium.net/temurin/releases/?version=17>

Then set `JAVA_HOME` **permanently** (Windows):

```powershell
# PowerShell, run once. Adjust the path to your install.
[Environment]::SetEnvironmentVariable(
  "JAVA_HOME",
  "C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot",
  "User")
```

macOS / Linux — add to `~/.zshrc` or `~/.bashrc`:

```bash
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
```

Open a **new** terminal and verify:

```bash
java -version    # must print 17.x
echo $JAVA_HOME  # must not be empty
```

> Do **not** put `org.gradle.java.home` in `android/gradle.properties`. It hardcodes
> a path containing your username and breaks the build for everyone else.

### 2.3 Android Studio + SDK

Install Android Studio: <https://developer.android.com/studio>

In **Settings → Languages & Frameworks → Android SDK**:

**SDK Platforms** tab — check *Show Package Details*:
- Android 15 (API 35) — `compileSdk`
- Android 14 (API 34) — `targetSdk`

**SDK Tools** tab — check *Show Package Details*:
- Android SDK Build-Tools **35.0.0**
- **NDK (Side by side) → 26.1.10909125** ← exact version, required for native code
- CMake
- Android SDK Platform-Tools
- Android Emulator (skip if you only use a physical device)

### 2.4 ANDROID_HOME

Windows (PowerShell, once):

```powershell
[Environment]::SetEnvironmentVariable(
  "ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
```

macOS / Linux:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
export ANDROID_HOME=$HOME/Android/Sdk           # Linux
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
```

New terminal, then verify:

```bash
adb --version
```

### 2.5 Disk space

Budget **25 GB free** before your first build:

| Item | Size |
|---|---|
| Android SDK + NDK | ~8 GB |
| Gradle caches (`~/.gradle`) | ~5 GB |
| One emulator image | ~2.5 GB |
| `node_modules` | ~500 MB |
| Debug APK + build output | ~1 GB |

A single build extracts a 206 MB React Native archive into a ~2.5 GB Gradle
transform cache. Building on a nearly-full disk fails in confusing ways.

---

## 3. Clone and install

```bash
git clone <REPO_URL>
cd block-blast-game
npm install
```

> **Never copy `node_modules` from another machine** (no zips, no USB, no network
> share). It caches absolute paths from the original machine; the native build
> then fails with `[CXX1210] No compatible library found`. Always `npm install`.

`android/local.properties` is gitignored and generated automatically. If the SDK
isn't found, create it manually:

```properties
# Windows (note the doubled backslashes)
sdk.dir=C:\\Users\\YOUR_NAME\\AppData\\Local\\Android\\Sdk
# macOS
sdk.dir=/Users/YOUR_NAME/Library/Android/sdk
```

---

## 4. Pick a device

### Option A — physical phone (recommended: faster, real performance)

1. **Settings → About phone →** tap **Build number** 7 times to enable Developer options.
2. **Settings → System → Developer options →** enable **USB debugging**.
3. Connect by USB and accept the *Allow USB debugging* prompt on the phone.

```bash
adb devices     # your device should be listed as "device", not "unauthorized"
```

### Option B — emulator

Android Studio → **Device Manager** → **Create Virtual Device** → Pixel 7,
system image API 36. Start it, then confirm with `adb devices`.

---

## 5. Run the app

```bash
npx expo run:android
```

First run takes **5–15 minutes** (it compiles native code). Later runs are far
faster. This command builds the APK, installs it, starts Metro, and launches the app.

Once it's running, **JS and component edits hot-reload instantly** — just save.

### When you must rebuild natively

A JS reload can't pick up native code. Re-run `npx expo run:android` after:

- adding/removing any package with a native module (`expo-av`, `expo-haptics`,
  `@react-native-async-storage/async-storage`, `netinfo`, …)
- changing anything in `android/`
- editing `app.json` permissions or config plugins

Rule of thumb: **new package → rebuild. JS-only change → hot reload.**

### Useful commands

```bash
npx expo start              # Metro only (JS changes, app already installed)
npx expo start --clear      # Metro with a cleared cache
adb devices                 # list connected devices
adb logcat | grep -i reactnativejs        # JS logs / errors
npx expo install <package>  # add a package at the SDK-52-correct version
```

Use `npx expo install`, **not** `npm install`, for Expo packages — it picks the
version matching SDK 52. Plain `npm install` can pull an SDK 53 build that fails
to compile.

---

## 6. Project layout

```
App.js                      Root component, state, persistence hydration
index.js                    Entry point (registerRootComponent)
app.json                    Expo config: name, icons, permissions, AdMob ID
src/
  screens/
    MainMenuScreen.js       Home: play, stats, coins, themes
    GameScreen.js           Board, scoring, combos, game-over
  components/
    GridBoard.js            8x8 grid
    PieceTray.js            Draggable piece tray
    Header.js               Score / coins / controls
    ComboOverlay.js         Combo animation
    BlastLayer.js           Line-clear effect
    StageBanner.js          Stage-up banner
    ThemeSelector.js        Theme shop
    AdWatchModal.js         Rewarded-ad modal
    Icon.js                 Emoji-glyph icons (no lucide-react on native)
  engine/
    gameLogic.js            Placement, line detection, scoring
    shapes.js               Piece definitions
    soundEngine.js          Runtime WAV synth via expo-av + haptics
    storage.js              AsyncStorage persistence (cached, sync reads)
  styles/themes.js          Theme palettes
android/                    Native project (generated; safe to delete + prebuild)
```

### Ignore the `.jsx` files

Some folders contain **stale `.jsx` twins** (`GameScreen.jsx`, `App.jsx`, …) left
from an early web prototype. They use `<div>`, `localStorage`, and `lucide-react`
and **do not run on Android**. The build only uses the **`.js`** files.

**Always edit the `.js` version.** The `.jsx` files are dead weight and should
eventually be deleted.

---

## 7. Troubleshooting — read this first

### `ERROR: JAVA_HOME is set to an invalid directory`
`JAVA_HOME` points at a JDK that was uninstalled or moved. Repoint it at JDK 17
(§2.2) and open a new terminal.

### `[CXX1210] No compatible library found`
Two very different causes:

**(a) `JAVA_TOOL_OPTIONS` is set.** This one is nasty and the error message is a
lie. If that variable is set (e.g. `-Dlog4j2.formatMsgNoLookups=true`), the JVM
prints `Picked up JAVA_TOOL_OPTIONS: ...` to stderr on every launch. Gradle reads
prefab's stderr, sees unexpected text, and reports "No compatible library found"
**even though prefab succeeded**. Check and clear it:

```bash
echo $JAVA_TOOL_OPTIONS          # should be empty
unset JAVA_TOOL_OPTIONS          # current shell (bash)
```
```powershell
[Environment]::SetEnvironmentVariable("JAVA_TOOL_OPTIONS", $null, "User")  # permanent
```

**(b) `node_modules` was copied from another machine.** Fix:
```bash
rm -rf node_modules package-lock.json
npm install
npx expo prebuild --clean
```

### `There is not enough space on the disk`
Android builds need several GB. Reclaim safely:
```bash
rm -rf ~/.gradle/caches/build-cache-1        # regenerates
rm -rf ~/.gradle/caches/transforms          # regenerates (often 2+ GB)
cd android && ./gradlew clean
```
Also delete unused emulator system images in Android Studio → Device Manager
(each is ~2.5 GB).

### `Unable to load script` / red screen
Metro isn't running or the phone can't reach it.
```bash
npx expo start          # keep this terminal OPEN -- closing it kills Metro
adb reverse tcp:8081 tcp:8081
```

### `The required package 'expo-asset' cannot be found`
```bash
npx expo install expo-asset
```

### App installs but immediately closes
Read the real error:
```bash
adb logcat -c        # clear
# relaunch the app, then:
adb logcat | grep -iE "ReactNativeJS|FATAL|AndroidRuntime"
```

### Native module changes not appearing
You hot-reloaded when you needed a rebuild. Run `npx expo run:android`.

### Nuclear reset (when all else fails)
```bash
rm -rf node_modules package-lock.json android
npm install
npx expo prebuild --clean
npx expo run:android
```
`android/` is generated — deleting it is safe **unless** you hand-edited native
files, so check `git status` first.

---

## 8. Working agreements

- **Never commit** `node_modules/`, `android/app/build/`, `.expo/`, `*.apk`, or
  `android/local.properties`. The `.gitignore` covers these.
- **Never commit machine-specific paths.** No `org.gradle.java.home`, no
  `C:\Users\<you>\...` anywhere in tracked files.
- **Use `npx expo install`** for Expo/React Native packages.
- **Commit `package-lock.json`.** It keeps everyone on identical versions.
- After pulling changes that touch `package.json`, run `npm install`; if the
  change added a native module, also re-run `npx expo run:android`.
- Branch per feature, PR into `main`.

---

## 9. First-day checklist

```
[ ] Node 20 or 22 installed          node -v
[ ] JDK 17 installed                 java -version   -> 17.x
[ ] JAVA_HOME set                    echo $JAVA_HOME
[ ] JAVA_TOOL_OPTIONS empty          echo $JAVA_TOOL_OPTIONS
[ ] Android Studio installed
[ ] SDK 35 + 34, Build-Tools 35.0.0
[ ] NDK 26.1.10909125 installed      (exact version)
[ ] ANDROID_HOME set                 adb --version
[ ] 25 GB free disk
[ ] Repo cloned, npm install clean
[ ] Device shows in adb devices
[ ] npx expo run:android succeeds
[ ] Edited a JS file, saw hot reload
```
