const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// ─── STEP 1: Fix the import – alias Map → MapIcon to avoid shadowing global Map ─
// Also check Network (used in YJS/WebRTC?), Filter (unused clash risk)
const oldImportSuffix = `, GitBranch, Filter, Map, Network, LayoutDashboard, Radar, Waypoints, TrendingDown`;
const newImportSuffix = `, GitBranch, Filter, Map as MapIcon, Network, LayoutDashboard, Radar, Waypoints, TrendingDown`;

if (content.includes(oldImportSuffix)) {
  content = content.replace(oldImportSuffix, newImportSuffix);
  console.log('✓ Aliased Map → MapIcon in import');
} else {
  console.log('✗ Could not find import suffix – checking for existing alias...');
  if (content.includes('Map as MapIcon')) {
    console.log('  Already aliased.');
  } else {
    process.exit(1);
  }
}

// ─── STEP 2: Replace the <Map size={24} /> reference in the chart block with <MapIcon /> ─
const oldMapUsage = `{ type: 'map',             label: 'Map Chart',      icon: <Map size={24} /> }`;
const newMapUsage = `{ type: 'map',             label: 'Map Chart',      icon: <MapIcon size={24} /> }`;

if (content.includes(oldMapUsage)) {
  content = content.replace(oldMapUsage, newMapUsage);
  console.log('✓ Replaced <Map /> → <MapIcon /> in chart block');
} else {
  console.log('✗ Could not find Map usage in chart block');
  process.exit(1);
}

// ─── STEP 3: Verify no remaining bare `Map` Lucide usage (not new Map() calls) ─
const lucideMapUsages = content.match(/<Map\s+size=\{24\}/g) || [];
console.log('Remaining bare <Map size={24}> usages:', lucideMapUsages.length, '(should be 0)');

// ─── STEP 4: Verify new Map() calls are untouched ───────────────────────────
const newMapCalls = (content.match(/\bnew Map\(/g) || []).length;
console.log('Native new Map() calls preserved:', newMapCalls, '(should be 5)');

// ─── STEP 5: Write back ──────────────────────────────────────────────────────
fs.writeFileSync(filePath, content, 'utf8');
console.log('\n✓ Fix applied successfully');
