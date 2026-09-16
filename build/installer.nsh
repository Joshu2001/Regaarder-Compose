; Regaarder Compose - Custom NSIS Installer Script
; Registers 'regaarder://' protocol handler, file associations, and Windows Explorer "New" context menu integration

!macro customInstall
  DetailPrint "Registering regaarder:// protocol handler..."
  WriteRegStr HKCR "regaarder" "" "URL:Regaarder Compose Protocol"
  WriteRegStr HKCR "regaarder" "URL Protocol" ""
  WriteRegStr HKCR "regaarder\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "regaarder\shell" "" "open"
  WriteRegStr HKCR "regaarder\shell\open" "" ""
  WriteRegStr HKCR "regaarder\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register ProgID for Regaarder Document
  WriteRegStr HKCR "Regaarder.Document" "" "Regaarder Document"
  WriteRegStr HKCR "Regaarder.Document\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "Regaarder.Document\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgdoc and Explorer "New > Regaarder Document"
  WriteRegStr HKCR ".rgdoc" "" "Regaarder.Document"
  WriteRegStr HKCR ".rgdoc" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgdoc" "Content Type" "application/x-regaarder-doc"
  WriteRegStr HKCR ".rgdoc\ShellNew" "NullFile" ""

  ; Register ProgID for Regaarder Spreadsheet
  WriteRegStr HKCR "Regaarder.Sheet" "" "Regaarder Spreadsheet"
  WriteRegStr HKCR "Regaarder.Sheet\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "Regaarder.Sheet\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgsht and Explorer "New > Regaarder Spreadsheet"
  WriteRegStr HKCR ".rgsht" "" "Regaarder.Sheet"
  WriteRegStr HKCR ".rgsht" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgsht" "Content Type" "application/x-regaarder-sheet"
  WriteRegStr HKCR ".rgsht\ShellNew" "NullFile" ""

  ; Register ProgID for Regaarder Deck
  WriteRegStr HKCR "Regaarder.Deck" "" "Regaarder Presentation Deck"
  WriteRegStr HKCR "Regaarder.Deck\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "Regaarder.Deck\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgdck and Explorer "New > Regaarder Presentation"
  WriteRegStr HKCR ".rgdck" "" "Regaarder.Deck"
  WriteRegStr HKCR ".rgdck" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgdck" "Content Type" "application/x-regaarder-deck"
  WriteRegStr HKCR ".rgdck\ShellNew" "NullFile" ""

  ; Notify Windows Shell of file association changes
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend

!macro customUnInstall
  DetailPrint "Cleaning up regaarder:// protocol handler and ShellNew associations..."
  DeleteRegKey HKCR "regaarder"
  DeleteRegKey HKCR "Regaarder.Document"
  DeleteRegKey HKCR ".rgdoc\ShellNew"
  DeleteRegKey HKCR "Regaarder.Sheet"
  DeleteRegKey HKCR ".rgsht\ShellNew"
  DeleteRegKey HKCR "Regaarder.Deck"
  DeleteRegKey HKCR ".rgdck\ShellNew"

  ; Notify Windows Shell of association removal
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend
