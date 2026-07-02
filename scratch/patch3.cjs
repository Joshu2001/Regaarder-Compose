const fs = require('fs');

const filePath = 'c:/Users/user/Downloads/Project MOAT/Regaarder Compose/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Font dropdown trigger change
const fontTriggerTarget = `                          <button
                            type="button"
                            onClick={() => setSheetToolbarMenuOpen((prev) => prev === 'font' ? null : 'font')}
                            className="inline-flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1.5 bg-white text-[13px] text-[#374151] transition-colors"
                          >`;

const fontTriggerReplacement = `                          <button
                            type="button"
                            onPointerDown={(e) => { e.preventDefault(); setSheetToolbarMenuOpen((prev) => prev === 'font' ? null : 'font'); }}
                            className="inline-flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1.5 bg-white text-[13px] text-[#374151] transition-colors"
                          >`;

if (content.includes(fontTriggerTarget)) {
  console.log('Found fontTriggerTarget, replacing...');
  content = content.replace(fontTriggerTarget, fontTriggerReplacement);
} else {
  console.error('Could not find fontTriggerTarget');
}

// 2. Font dropdown container change
const fontContainerTarget = `                          {sheetToolbarMenuOpen === 'font' && (
                            <div className="absolute z-[420] top-full mt-1 left-0 w-48 max-h-40 overflow-y-auto thin-scrollbar rounded-lg border border-gray-200 bg-white shadow-lg p-1">`;

const fontContainerReplacement = `                          {sheetToolbarMenuOpen === 'font' && (
                            <div onPointerDown={(e) => e.preventDefault()} className="absolute z-[420] top-full mt-1 left-0 w-48 max-h-40 overflow-y-auto thin-scrollbar rounded-lg border border-gray-200 bg-white shadow-lg p-1">`;

if (content.includes(fontContainerTarget)) {
  console.log('Found fontContainerTarget, replacing...');
  content = content.replace(fontContainerTarget, fontContainerReplacement);
} else {
  console.error('Could not find fontContainerTarget');
}

// 3. Font Size dropdown trigger change
const fontSizeTriggerTarget = `                          <button
                            type="button"
                            onClick={() => setSheetToolbarMenuOpen((prev) => prev === 'size' ? null : 'size')}
                            className="inline-flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1.5 bg-white text-[13px] text-[#374151] transition-colors"
                          >`;

const fontSizeTriggerReplacement = `                          <button
                            type="button"
                            onPointerDown={(e) => { e.preventDefault(); setSheetToolbarMenuOpen((prev) => prev === 'size' ? null : 'size'); }}
                            className="inline-flex items-center gap-1 hover:bg-gray-100 rounded-lg px-2 py-1.5 bg-white text-[13px] text-[#374151] transition-colors"
                          >`;

if (content.includes(fontSizeTriggerTarget)) {
  console.log('Found fontSizeTriggerTarget, replacing...');
  content = content.replace(fontSizeTriggerTarget, fontSizeTriggerReplacement);
} else {
  console.error('Could not find fontSizeTriggerTarget');
}

// 4. Font Size dropdown container change
const fontSizeContainerTarget = `                          {sheetToolbarMenuOpen === 'size' && (
                            <div className="absolute z-[420] top-full mt-1 left-0 w-24 max-h-40 overflow-y-auto thin-scrollbar rounded-lg border border-gray-200 bg-white shadow-lg p-1">`;

const fontSizeContainerReplacement = `                          {sheetToolbarMenuOpen === 'size' && (
                            <div onPointerDown={(e) => e.preventDefault()} className="absolute z-[420] top-full mt-1 left-0 w-24 max-h-40 overflow-y-auto thin-scrollbar rounded-lg border border-gray-200 bg-white shadow-lg p-1">`;

if (content.includes(fontSizeContainerTarget)) {
  console.log('Found fontSizeContainerTarget, replacing...');
  content = content.replace(fontSizeContainerTarget, fontSizeContainerReplacement);
} else {
  console.error('Could not find fontSizeContainerTarget');
}

// 5. Text Style trigger change
const textStyleTriggerTarget = `                             <div className="relative text-style-menu-container flex items-center">
                              <button
                                type="button"
                                onClick={() => setSheetToolbarMenuOpen((prev) => prev === 'textStyle' ? null : 'textStyle')}
                                className="h-8 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer text-[#374151]"
                                title="Format options (Style & Colors)"
                              >`;

const textStyleTriggerReplacement = `                             <div className="relative text-style-menu-container flex items-center">
                              <button
                                type="button"
                                onPointerDown={(e) => { e.preventDefault(); setSheetToolbarMenuOpen((prev) => prev === 'textStyle' ? null : 'textStyle'); }}
                                className="h-8 px-2 flex items-center justify-center gap-1.5 rounded-lg transition-colors hover:bg-gray-100 cursor-pointer text-[#374151]"
                                title="Format options (Style & Colors)"
                              >`;

if (content.includes(textStyleTriggerTarget)) {
  console.log('Found textStyleTriggerTarget, replacing...');
  content = content.replace(textStyleTriggerTarget, textStyleTriggerReplacement);
} else {
  // Try normal spacing in case indentation is slightly different
  const normalizedTarget = textStyleTriggerTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found textStyleTriggerTarget (normalized), replacing...');
    content = content.replace(new RegExp(textStyleTriggerTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), textStyleTriggerReplacement);
  } else {
    console.error('Could not find textStyleTriggerTarget');
  }
}

// 6. Text Style container change
const textStyleContainerTarget = `                              {sheetToolbarMenuOpen === 'textStyle' && (
                                <div className="absolute top-8 left-0 z-[230] w-48 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 flex flex-col gap-3">`;

const textStyleContainerReplacement = `                              {sheetToolbarMenuOpen === 'textStyle' && (
                                <div onPointerDown={(e) => e.preventDefault()} className="absolute top-8 left-0 z-[230] w-48 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 flex flex-col gap-3">`;

if (content.includes(textStyleContainerTarget)) {
  console.log('Found textStyleContainerTarget, replacing...');
  content = content.replace(textStyleContainerTarget, textStyleContainerReplacement);
} else {
  const normalizedTarget = textStyleContainerTarget.replace(/\r?\n/g, '\n');
  const normalizedContent = content.replace(/\r?\n/g, '\n');
  if (normalizedContent.includes(normalizedTarget)) {
    console.log('Found textStyleContainerTarget (normalized), replacing...');
    content = content.replace(new RegExp(textStyleContainerTarget.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/\r?\n/g, '\\r?\\n')), textStyleContainerReplacement);
  } else {
    console.error('Could not find textStyleContainerTarget');
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Patch complete.');
