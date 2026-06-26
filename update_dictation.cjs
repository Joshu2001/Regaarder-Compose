const fs = require('fs');
let app = fs.readFileSync('src/App.jsx', 'utf8');

const targetStr = `  const shouldHideDictationOverlay =
    openDropdown !== null
    || textStyleMenuOpen
    || languageMenuOpen
    || Boolean(openDocMenuId)
    || Boolean(openWorkspaceMenuId)
    || isPromptMenuOpen
    || promptTuneMenuOpen
    || promptFormatMenuOpen
    || promptLibraryOpen
    || promptHistoryFilterMenuOpen
    || Boolean(sheetToolbarMenuOpen)
    || deckToolbarMenuOpen
    || notificationsOpen
    || replayPanelOpen
    || replaySpeedMenuOpen`;

const replacementStr = `  const shouldHideDictationOverlay =
    openDropdown !== null
    || textStyleMenuOpen
    || languageMenuOpen
    || Boolean(openDocMenuId)
    || Boolean(openWorkspaceMenuId)
    || isPromptMenuOpen
    || promptTuneMenuOpen
    || promptFormatMenuOpen
    || promptLibraryOpen
    || promptHistoryFilterMenuOpen
    || Boolean(sheetToolbarMenuOpen)
    || deckToolbarMenuOpen
    || notificationsOpen
    || replayPanelOpen
    || replaySpeedMenuOpen
    || insertDropdownOpen
    || listDropdownOpen
    || composeEmojiPickerOpen
    || symbolsPickerOpen
    || equationsPickerOpen
    || !!listGalleryOpen
    || slashMenu.open
    || deckSlashMenu.open`;

if (app.includes(targetStr)) {
  app = app.replace(targetStr, replacementStr);
  fs.writeFileSync('src/App.jsx', app);
  console.log('shouldHideDictationOverlay updated successfully.');
} else {
  // Let's try with \r\n instead of \n
  const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');
  const replacementStrCRLF = replacementStr.replace(/\n/g, '\r\n');
  if (app.includes(targetStrCRLF)) {
    app = app.replace(targetStrCRLF, replacementStrCRLF);
    fs.writeFileSync('src/App.jsx', app);
    console.log('shouldHideDictationOverlay updated successfully (CRLF).');
  } else {
    console.error('Could not find shouldHideDictationOverlay to replace.');
  }
}
