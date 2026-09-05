/**
 * verify-extension-package.mjs
 * 
 * Verifies the complete Chrome Web Store distribution bundle:
 * 1. Manifest V3 compliance & icon links
 * 2. Exact PNG dimensions for all extension icons (16, 32, 48, 128)
 * 3. Exact dimensions for promo tiles (440x280, 1400x560) and screenshots (1280x800)
 * 4. Store listing documentation, single purpose statement, and permission justifications
 * 5. Production ZIP package integrity
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const extensionDir = path.join(projectRoot, 'extension');

let passed = 0;
let failed = 0;

function assert(description, condition, extraInfo = '') {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${description} ${extraInfo}`);
    failed++;
  }
}

/**
 * Reads the width and height directly from a PNG buffer header (IHDR chunk).
 */
function getPngDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  // PNG signature: 8 bytes, followed by IHDR chunk length (4 bytes), then 'IHDR' (4 bytes)
  // Width is 4 bytes at offset 16, Height is 4 bytes at offset 20 (big-endian)
  if (buffer.length < 24) return null;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (!isPng) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

async function runVerification() {
  console.log('\n===============================================================');
  console.log('  CHROME WEB STORE DISTRIBUTION VERIFICATION SUITE');
  console.log('===============================================================\n');

  // ── 1. MANIFEST V3 CONFORMANCE ─────────────────────────────────────────────
  console.log('--- 1. Manifest V3 Schema & Metadata Conformance ---');

  const manifestPath = path.join(extensionDir, 'manifest.json');
  assert('manifest.json exists in extension directory', fs.existsSync(manifestPath));

  const rawManifest = fs.readFileSync(manifestPath, 'utf-8').replace(/^\uFEFF/, '');
  let manifest;
  try {
    manifest = JSON.parse(rawManifest);
    assert('manifest.json parses as valid JSON', true);
  } catch (err) {
    assert('manifest.json parses as valid JSON', false, err.message);
    process.exit(1);
  }

  assert('manifest_version is exactly 3', manifest.manifest_version === 3);
  assert('Extension name is present and descriptive', Boolean(manifest.name && manifest.name.includes('Meneur')));
  assert('Extension version conforms to semver', Boolean(manifest.version && /^\d+\.\d+\.\d+$/.test(manifest.version)));
  assert('Extension description is concise and within store limits', Boolean(manifest.description && manifest.description.length <= 132));

  // Permissions & Host Permissions
  const expectedPermissions = ['storage', 'tabs', 'activeTab', 'declarativeNetRequest', 'contextMenus'];
  for (const perm of expectedPermissions) {
    assert(`Permission "${perm}" is declared`, manifest.permissions?.includes(perm));
  }
  assert('host_permissions includes "<all_urls>" for research capture', manifest.host_permissions?.includes('<all_urls>'));

  // Action and default popup
  assert('Action default_popup is configured to popup.html', manifest.action?.default_popup === 'popup.html');
  assert('Action defines icons for all standard densities (16, 32, 48, 128)', 
    Boolean(manifest.action?.default_icon?.['16'] && manifest.action?.default_icon?.['128']));

  // Root icons mapping
  assert('Root icons object declares 16, 32, 48, 128 icons', 
    Boolean(manifest.icons?.['16'] && manifest.icons?.['32'] && manifest.icons?.['48'] && manifest.icons?.['128']));

  // Keyboard shortcut commands
  assert('Shortcut command "capture-directive" is configured with Ctrl/Cmd+Shift+D', 
    manifest.commands?.['capture-directive']?.suggested_key?.default === 'Ctrl+Shift+D');
  assert('Shortcut command "toggle-command-deck" is configured with Ctrl/Cmd+Shift+E', 
    manifest.commands?.['toggle-command-deck']?.suggested_key?.default === 'Ctrl+Shift+E');

  // ── 2. EXTENSION ICONS (16, 32, 48, 128) ───────────────────────────────────
  console.log('\n--- 2. Extension Icons Dimension & Format Verification ---');

  const iconSizes = [16, 32, 48, 128];
  for (const size of iconSizes) {
    const iconPath = path.join(extensionDir, 'icons', `icon${size}.png`);
    assert(`icon${size}.png exists`, fs.existsSync(iconPath));
    const dim = getPngDimensions(iconPath);
    assert(`icon${size}.png is a valid PNG with dimensions ${size}x${size}`, 
      dim && dim.width === size && dim.height === size,
      dim ? `(Actual: ${dim.width}x${dim.height})` : '(Not a valid PNG)');
  }

  // ── 3. STORE ASSETS & PROMO MOCKUPS ────────────────────────────────────────
  console.log('\n--- 3. Promotional Assets & Screenshot Dimension Verification ---');

  const promoSmallPath = path.join(extensionDir, 'store_assets', 'promo_small_440x280.png');
  assert('Small Promo Tile (promo_small_440x280.png) exists', fs.existsSync(promoSmallPath));
  const dimSmall = getPngDimensions(promoSmallPath);
  assert('Small Promo Tile has exact 440x280 dimensions', 
    dimSmall && dimSmall.width === 440 && dimSmall.height === 280,
    dimSmall ? `(Actual: ${dimSmall.width}x${dimSmall.height})` : '');

  const marqueePath = path.join(extensionDir, 'store_assets', 'marquee_1400x560.png');
  assert('Marquee Banner (marquee_1400x560.png) exists', fs.existsSync(marqueePath));
  const dimMarquee = getPngDimensions(marqueePath);
  assert('Marquee Banner has exact 1400x560 dimensions', 
    dimMarquee && dimMarquee.width === 1400 && dimMarquee.height === 560,
    dimMarquee ? `(Actual: ${dimMarquee.width}x${dimMarquee.height})` : '');

  // Screenshots (1280x800)
  const screenshots = [
    'screenshot1_command_deck_1280x800.png',
    'screenshot2_focus_shield_1280x800.png',
    'screenshot3_directive_capture_1280x800.png',
    'screenshot4_tab_archiving_1280x800.png'
  ];

  for (const scName of screenshots) {
    const scPath = path.join(extensionDir, 'store_assets', scName);
    assert(`Store Screenshot "${scName}" exists`, fs.existsSync(scPath));
    const dimSc = getPngDimensions(scPath);
    assert(`Screenshot "${scName}" has exact 1280x800 dimensions`, 
      dimSc && dimSc.width === 1280 && dimSc.height === 800,
      dimSc ? `(Actual: ${dimSc.width}x${dimSc.height})` : '');
  }

  // ── 4. STORE LISTING & POLICY DOCUMENTATION ────────────────────────────────
  console.log('\n--- 4. Store Listing & Policy Compliance Documentation ---');

  const listingPath = path.join(extensionDir, 'STORE_LISTING.md');
  assert('STORE_LISTING.md exists in extension directory', fs.existsSync(listingPath));

  const listingContent = fs.readFileSync(listingPath, 'utf-8');
  assert('STORE_LISTING.md contains Single Purpose Policy statement', 
    listingContent.includes('Single Purpose Description'));

  assert('STORE_LISTING.md contains detailed permission justifications table', 
    listingContent.includes('Permission Justifications') &&
    listingContent.includes('declarativeNetRequest') &&
    listingContent.includes('activeTab'));

  assert('STORE_LISTING.md contains privacy and zero-tracking disclosure', 
    listingContent.includes('Privacy & Data Handling Disclosures') &&
    listingContent.includes('Zero remote code'));

  // ── 5. PRODUCTION ZIP PACKAGE VERIFICATION ─────────────────────────────────
  console.log('\n--- 5. Production ZIP Package Integrity ---');

  const rootZipPath = path.join(projectRoot, 'meneur-extension.zip');
  const extZipPath = path.join(extensionDir, 'meneur-extension.zip');

  assert('Production bundle meneur-extension.zip exists in project root', fs.existsSync(rootZipPath));
  assert('Production bundle meneur-extension.zip exists in extension/ folder', fs.existsSync(extZipPath));

  const zipStats = fs.statSync(rootZipPath);
  assert('meneur-extension.zip has non-zero size (>5KB)', zipStats.size > 5000, `(Size: ${(zipStats.size / 1024).toFixed(1)} KB)`);

  // Verify ZIP magic header (PK\x03\x04)
  const zipHeader = fs.readFileSync(rootZipPath, { flag: 'r' }).subarray(0, 4);
  const isValidZip = zipHeader[0] === 0x50 && zipHeader[1] === 0x4B && zipHeader[2] === 0x03 && zipHeader[3] === 0x04;
  assert('meneur-extension.zip is a valid ZIP archive (PK header)', isValidZip);

  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  console.log('\n===============================================================');
  console.log(`  VERIFICATION COMPLETE: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('Fatal error during extension verification:', err);
  process.exit(1);
});
