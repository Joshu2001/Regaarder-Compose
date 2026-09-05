/**
 * Regaarder Compose - Native Desktop Packaging & Signing Test Suite
 * 
 * Verifies electron-builder multi-target configuration, Apple entitlements,
 * Windows NSIS registry hooks, icon assets, auto-updater lifecycle, and signing readiness.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('\n============================================================');
console.log('   TESTING NATIVE ELECTRON PACKAGING, SIGNING & UPDATES    ');
console.log('============================================================\n');

// 1. electron-builder.json Validation
console.log('Test Suite 1: electron-builder.json Configuration');
const builderConfigPath = path.join(rootDir, 'electron-builder.json');
assert(fs.existsSync(builderConfigPath), 'electron-builder.json exists');

let builderConfig = {};
try {
  builderConfig = JSON.parse(fs.readFileSync(builderConfigPath, 'utf8'));
  assert(builderConfig.appId === 'com.regaarder.compose', 'appId is com.regaarder.compose');
  assert(builderConfig.productName === 'Regaarder Compose', 'productName is Regaarder Compose');
  assert(Array.isArray(builderConfig.files) && builderConfig.files.includes('dist/**/*'), 'Includes dist/**/* files');
  assert(builderConfig.files.includes('electron/**/*'), 'Includes electron/**/* files');

  // macOS target checks
  assert(builderConfig.mac && builderConfig.mac.hardenedRuntime === true, 'macOS hardenedRuntime is enabled');
  assert(builderConfig.mac.entitlements === 'build/entitlements.mac.plist', 'macOS entitlements configured');
  assert(builderConfig.mac.entitlementsInherit === 'build/entitlements.mac.inherit.plist', 'macOS inherit entitlements configured');
  const macTargets = builderConfig.mac.target.map(t => typeof t === 'string' ? t : t.target);
  assert(macTargets.includes('dmg') && macTargets.includes('zip'), 'macOS targets include dmg and zip');

  // Windows target checks
  assert(builderConfig.win && builderConfig.win.icon === 'build/icon.ico', 'Windows icon set to build/icon.ico');
  const winTargets = builderConfig.win.target.map(t => typeof t === 'string' ? t : t.target);
  assert(winTargets.includes('nsis') && winTargets.includes('portable'), 'Windows targets include nsis and portable');
  assert(builderConfig.nsis && builderConfig.nsis.include === 'build/installer.nsh', 'NSIS script includes build/installer.nsh');
  assert(builderConfig.win.signtoolOptions && builderConfig.win.signtoolOptions.rfc3161TimeStampServer === 'http://timestamp.digicert.com', 'RFC 3161 timestamp server configured for Authenticode in signtoolOptions');

  // Linux target checks
  assert(builderConfig.linux && builderConfig.linux.icon === 'build/icons', 'Linux icon path set to build/icons');
  const linuxTargets = builderConfig.linux.target.map(t => typeof t === 'string' ? t : t.target);
  assert(linuxTargets.includes('AppImage') && linuxTargets.includes('deb'), 'Linux targets include AppImage and deb');

  // Publish / Auto-Update checks
  assert(Array.isArray(builderConfig.publish), 'publish array configured');
  const ghPublish = builderConfig.publish.find(p => p.provider === 'github');
  assert(ghPublish && ghPublish.owner === 'Joshu2001' && ghPublish.repo === 'Regaarder-Compose', 'GitHub auto-update provider target is Joshu2001/Regaarder-Compose');

  // Protocol Handler registration
  assert(Array.isArray(builderConfig.protocols), 'Protocol handler array defined');
  const regProtocol = builderConfig.protocols.find(p => p.schemes && p.schemes.includes('regaarder'));
  assert(!!regProtocol, 'regaarder:// protocol scheme registered');
} catch (e) {
  assert(false, `electron-builder.json JSON parse error: ${e.message}`);
}

// 2. macOS Entitlements Validation
console.log('\nTest Suite 2: macOS Hardened Runtime Entitlements');
const macEntitlements = fs.readFileSync(path.join(rootDir, 'build', 'entitlements.mac.plist'), 'utf8');
assert(macEntitlements.includes('com.apple.security.cs.allow-jit'), 'Entitlements allow V8 JIT');
assert(macEntitlements.includes('com.apple.security.cs.allow-unsigned-executable-memory'), 'Entitlements allow unsigned memory');
assert(macEntitlements.includes('com.apple.security.device.camera'), 'Entitlements allow camera access');
assert(macEntitlements.includes('com.apple.security.device.microphone'), 'Entitlements allow microphone access');
assert(macEntitlements.includes('com.apple.security.network.client'), 'Entitlements allow network client');
assert(macEntitlements.includes('com.apple.security.network.server'), 'Entitlements allow network server (Pillar 2 MCP)');

const macInheritEntitlements = fs.readFileSync(path.join(rootDir, 'build', 'entitlements.mac.inherit.plist'), 'utf8');
assert(macInheritEntitlements.includes('com.apple.security.inherit'), 'Inherit entitlements contain inherit flag');

// 3. Windows NSIS Deep Linking Validation
console.log('\nTest Suite 3: Windows NSIS Installer Protocol Hooks');
const nsisContent = fs.readFileSync(path.join(rootDir, 'build', 'installer.nsh'), 'utf8');
assert(nsisContent.includes('regaarder'), 'NSIS registers regaarder protocol');
assert(nsisContent.includes('URL:Regaarder Compose Protocol'), 'NSIS registers protocol description');
assert(nsisContent.includes('customInstall'), 'NSIS contains customInstall macro');
assert(nsisContent.includes('customUnInstall'), 'NSIS contains customUnInstall cleanup macro');

// 4. Icon Assets Validation
console.log('\nTest Suite 4: Multi-Resolution Native Icon Assets');
assert(fs.existsSync(path.join(rootDir, 'build', 'icon.ico')), 'build/icon.ico exists');
assert(fs.statSync(path.join(rootDir, 'build', 'icon.ico')).size > 1000, 'build/icon.ico size > 1KB');

assert(fs.existsSync(path.join(rootDir, 'build', 'icon.png')), 'build/icon.png exists (512x512)');
assert(fs.statSync(path.join(rootDir, 'build', 'icon.png')).size > 1000, 'build/icon.png size > 1KB');

const linuxSizes = [16, 24, 32, 48, 64, 128, 256, 512];
for (const s of linuxSizes) {
  const p = path.join(rootDir, 'build', 'icons', `${s}x${s}.png`);
  assert(fs.existsSync(p), `Linux icon exists: build/icons/${s}x${s}.png`);
}

// 5. Auto-Updater & Main/Preload Wiring
console.log('\nTest Suite 5: Auto-Updater Lifecycle & IPC Integration');
const autoUpdaterModule = path.join(rootDir, 'electron', 'autoUpdater.cjs');
assert(fs.existsSync(autoUpdaterModule), 'electron/autoUpdater.cjs exists');

const updaterSrc = fs.readFileSync(autoUpdaterModule, 'utf8');
assert(updaterSrc.includes('initAutoUpdater'), 'autoUpdater.cjs exports initAutoUpdater');
assert(updaterSrc.includes('updater:check-for-updates'), 'autoUpdater.cjs handles updater:check-for-updates');
assert(updaterSrc.includes('updater:download-update'), 'autoUpdater.cjs handles updater:download-update');
assert(updaterSrc.includes('updater:quit-and-install'), 'autoUpdater.cjs handles updater:quit-and-install');
assert(updaterSrc.includes('updater:status'), 'autoUpdater.cjs emits updater:status stream');

const mainSrc = fs.readFileSync(path.join(rootDir, 'electron', 'main.cjs'), 'utf8');
assert(mainSrc.includes("require('./autoUpdater.cjs')"), 'main.cjs imports autoUpdater.cjs');
assert(mainSrc.includes('initAutoUpdater(mainWindow)'), 'main.cjs initializes autoUpdater with mainWindow');
assert(mainSrc.includes('app.isPackaged'), 'main.cjs supports instant loading in packaged mode');

const preloadSrc = fs.readFileSync(path.join(rootDir, 'electron', 'preload.cjs'), 'utf8');
assert(preloadSrc.includes('checkForUpdates:'), 'preload.cjs exposes checkForUpdates');
assert(preloadSrc.includes('downloadUpdate:'), 'preload.cjs exposes downloadUpdate');
assert(preloadSrc.includes('quitAndInstallUpdate:'), 'preload.cjs exposes quitAndInstallUpdate');
assert(preloadSrc.includes('getUpdateChannel:'), 'preload.cjs exposes getUpdateChannel');
assert(preloadSrc.includes('setUpdateChannel:'), 'preload.cjs exposes setUpdateChannel');
assert(preloadSrc.includes('onUpdaterStatus:'), 'preload.cjs exposes onUpdaterStatus event subscription');

// 6. Packaging Driver Script Validation
console.log('\nTest Suite 6: Packaging Driver Scripts');
const pkgScript = path.join(rootDir, 'scripts', 'package-electron.mjs');
assert(fs.existsSync(pkgScript), 'scripts/package-electron.mjs exists');
const pkgJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
assert(!!pkgJson.scripts['package:all'], 'package.json has script package:all');
assert(!!pkgJson.scripts['package:win'], 'package.json has script package:win');
assert(!!pkgJson.scripts['package:mac'], 'package.json has script package:mac');
assert(!!pkgJson.scripts['package:linux'], 'package.json has script package:linux');
assert(!!pkgJson.scripts['package:dir'], 'package.json has script package:dir');
assert(!!pkgJson.scripts['test:packaging'], 'package.json has script test:packaging');

console.log('\n============================================================');
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
console.log('============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
