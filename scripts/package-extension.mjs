/**
 * package-extension.mjs
 * 
 * Packages the Meneur Web Experience Chrome Extension into a production-ready
 * Manifest V3 bundle (meneur-extension.zip) ready for Chrome Web Store Developer Dashboard.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const extensionDir = path.join(projectRoot, 'extension');
const stagingDir = path.join(projectRoot, 'dist-extension');
const zipOutputPath = path.join(projectRoot, 'meneur-extension.zip');
const extensionZipPath = path.join(extensionDir, 'meneur-extension.zip');

console.log('\n===============================================================');
console.log('  PACKAGING MENEUR CHROME WEB STORE EXTENSION');
console.log('===============================================================\n');

// 1. Clean and prepare staging directory
if (fs.existsSync(stagingDir)) {
  fs.rmSync(stagingDir, { recursive: true, force: true });
}
fs.mkdirSync(stagingDir, { recursive: true });

// 2. Validate manifest.json
const manifestPath = path.join(extensionDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found in extension directory.');
  process.exit(1);
}

const rawManifest = fs.readFileSync(manifestPath, 'utf-8').replace(/^\uFEFF/, '');
const manifest = JSON.parse(rawManifest);
console.log(`✓ Validated Manifest V3: ${manifest.name} (v${manifest.version})`);

// 3. Copy essential distribution files
const filesToCopy = [
  'manifest.json',
  'background.js',
  'contentScript.js',
  'popup.html',
  'popup.js',
  'styles.css'
];

for (const file of filesToCopy) {
  const src = path.join(extensionDir, file);
  const dest = path.join(stagingDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Staged: ${file}`);
  } else {
    console.error(`Error: Missing required file ${file}`);
    process.exit(1);
  }
}

// 4. Copy icons folder
const iconsSrcDir = path.join(extensionDir, 'icons');
const iconsDestDir = path.join(stagingDir, 'icons');
if (!fs.existsSync(iconsSrcDir)) {
  console.error('Error: icons directory missing.');
  process.exit(1);
}

fs.mkdirSync(iconsDestDir, { recursive: true });
const iconFiles = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'];
for (const icon of iconFiles) {
  const src = path.join(iconsSrcDir, icon);
  const dest = path.join(iconsDestDir, icon);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Staged icon: icons/${icon}`);
  } else {
    console.error(`Error: Missing required icon icons/${icon}`);
    process.exit(1);
  }
}

// 5. Create ZIP package using PowerShell Compress-Archive
if (fs.existsSync(zipOutputPath)) {
  fs.rmSync(zipOutputPath, { force: true });
}

console.log('\nCreating compressed archive...');
const psCommand = `powershell -Command "Compress-Archive -Path '${stagingDir}\\*' -DestinationPath '${zipOutputPath}' -Force"`;
execSync(psCommand, { stdio: 'inherit' });

// Also copy to extension/ directory for convenience
fs.copyFileSync(zipOutputPath, extensionZipPath);

const stats = fs.statSync(zipOutputPath);
console.log(`\n✓ Successfully created: meneur-extension.zip (${(stats.size / 1024).toFixed(1)} KB)`);
console.log(`✓ Output Location 1: ${zipOutputPath}`);
console.log(`✓ Output Location 2: ${extensionZipPath}`);

// Clean up staging folder
fs.rmSync(stagingDir, { recursive: true, force: true });
console.log('✓ Staging cleanup complete.\n');
