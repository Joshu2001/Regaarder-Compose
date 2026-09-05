#!/usr/bin/env node

/**
 * Regaarder Compose - Native Desktop Packaging & Distribution Pipeline
 * 
 * Drives electron-builder compilation across macOS (.dmg/.zip),
 * Windows (.exe / NSIS / portable), and Linux (.AppImage / .deb),
 * with code-signing validation and auto-update release publishing.
 */

import { execSync, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n============================================================');
console.log('   REGAARDER COMPOSE — NATIVE DESKTOP PACKAGING ENGINE     ');
console.log('============================================================\n');

// 1. Verify Prerequisites
const distIndex = path.join(rootDir, 'dist', 'index.html');
if (!fs.existsSync(distIndex)) {
  console.log('[Packaging] Production web bundle dist/index.html not found. Running vite build...');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
} else {
  console.log('[Packaging] [OK] dist/index.html production bundle verified.');
}

// 2. Verify Assets & Entitlements
const requiredAssets = [
  'build/icon.ico',
  'build/icon.png',
  'build/entitlements.mac.plist',
  'build/entitlements.mac.inherit.plist',
  'build/installer.nsh',
  'electron-builder.json'
];

for (const relPath of requiredAssets) {
  const fullPath = path.join(rootDir, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`[Packaging Error] Required build asset missing: ${relPath}`);
  }
}
console.log('[Packaging] [OK] All icons, entitlements, and installer scripts verified.');

// 3. Inspect Code-Signing & Notarization Credentials
console.log('\n--- Code Signing & Distribution Diagnostics ---');

// Windows Authenticode
const hasWinCert = !!(process.env.WIN_CSC_LINK || process.env.CSC_LINK);
if (hasWinCert) {
  console.log('  [Windows Signing] [DETECTED] CSC_LINK certificate configured.');
} else {
  console.log('  [Windows Signing] [INFO] No CSC_LINK detected. Packaging unsigned / self-signed test binary.');
}

// macOS Hardened Runtime & Notarization
const hasMacCert = !!(process.env.CSC_LINK && (process.env.APPLE_ID || process.env.APPLE_APP_SPECIFIC_PASSWORD));
if (hasMacCert) {
  console.log('  [macOS Notarization] [DETECTED] Apple Developer ID & Notarization credentials detected.');
} else {
  console.log('  [macOS Notarization] [INFO] No Apple credentials detected. Packaged in ad-hoc hardened mode.');
}

// Auto-Update Channel (GitHub Releases)
const hasGhToken = !!(process.env.GH_TOKEN || process.env.GITHUB_TOKEN);
if (hasGhToken) {
  console.log('  [Auto-Update Channel] [DETECTED] GitHub token detected. Auto-update releases can be published.');
} else {
  console.log('  [Auto-Update Channel] [INFO] GH_TOKEN not set. Packaged locally without remote publishing.');
}

// 4. Parse Target Arguments
const args = process.argv.slice(2);
let builderArgs = [];

if (args.includes('--dir')) {
  builderArgs.push('--dir');
} else if (args.includes('--win')) {
  builderArgs.push('--win');
} else if (args.includes('--mac')) {
  builderArgs.push('--mac');
} else if (args.includes('--linux')) {
  builderArgs.push('--linux');
} else if (args.includes('--all')) {
  // If host is win32, electron-builder can package win & linux. macOS requires Darwin host or remote agent.
  if (process.platform === 'darwin') {
    builderArgs.push('--mac', '--win', '--linux');
  } else {
    console.log('[Packaging] Note: macOS binaries require macOS host. Packaging Windows + Linux targets.');
    builderArgs.push('--win', '--linux');
  }
} else {
  // Default to native host platform
  console.log(`[Packaging] Defaulting to host platform: ${process.platform}`);
  if (process.platform === 'win32') {
    builderArgs.push('--win');
  } else if (process.platform === 'darwin') {
    builderArgs.push('--mac');
  } else {
    builderArgs.push('--linux');
  }
}

if (args.includes('--publish') && hasGhToken) {
  builderArgs.push('--publish', 'always');
} else {
  builderArgs.push('--publish', 'never');
}

console.log(`\n[Packaging] Executing: npx electron-builder ${builderArgs.join(' ')}\n`);

const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const run = spawnSync(cmd, ['electron-builder', ...builderArgs], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
});

if (run.error) {
  console.error('[Packaging Error]', run.error);
  process.exit(1);
}

if (run.status !== 0) {
  console.error(`[Packaging Error] electron-builder exited with code ${run.status}`);
  process.exit(run.status);
}

console.log('\n============================================================');
console.log('   PACKAGING COMPLETE — OUTPUT STORED IN release/           ');
console.log('============================================================\n');
