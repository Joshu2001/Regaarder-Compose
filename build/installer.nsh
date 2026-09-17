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

  ; Install file icons into $INSTDIR\resources\icons
  CreateDirectory "$INSTDIR\resources\icons"
  File /oname=$INSTDIR\resources\icons\doc.ico "${BUILD_RESOURCES_DIR}\doc.ico"
  File /oname=$INSTDIR\resources\icons\sheet.ico "${BUILD_RESOURCES_DIR}\sheet.ico"
  File /oname=$INSTDIR\resources\icons\deck.ico "${BUILD_RESOURCES_DIR}\deck.ico"
  File /oname=$INSTDIR\resources\icons\whiteboard.ico "${BUILD_RESOURCES_DIR}\whiteboard.ico"
  File /oname=$INSTDIR\resources\icons\workspace.ico "${BUILD_RESOURCES_DIR}\icon.ico"

  ; Register Top-Level "Open with Regaarder Workspace" Shell Verb on all files (*)
  WriteRegStr HKCR "*\shell\RegaarderWorkspace" "" "Open with Regaarder Workspace"
  WriteRegStr HKCR "*\shell\RegaarderWorkspace" "Icon" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "*\shell\RegaarderWorkspace\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register ProgID for Regaarder Document
  WriteRegStr HKCR "Regaarder.Document" "" "Regaarder Document"
  WriteRegStr HKCR "Regaarder.Document\DefaultIcon" "" "$INSTDIR\resources\icons\doc.ico"
  WriteRegStr HKCR "Regaarder.Document\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgdoc and Explorer "New > Regaarder Document"
  WriteRegStr HKCR ".rgdoc" "" "Regaarder.Document"
  WriteRegStr HKCR ".rgdoc" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgdoc" "Content Type" "application/x-regaarder-doc"
  WriteRegStr HKCR ".rgdoc\ShellNew" "NullFile" ""
  WriteRegStr HKCR ".rgdoc\ShellNew" "ItemName" "Regaarder Document"
  WriteRegStr HKCR ".rgdoc\ShellNew" "IconPath" "$INSTDIR\resources\icons\doc.ico"

  ; Register ProgID for Regaarder Spreadsheet
  WriteRegStr HKCR "Regaarder.Sheet" "" "Regaarder Spreadsheet"
  WriteRegStr HKCR "Regaarder.Sheet\DefaultIcon" "" "$INSTDIR\resources\icons\sheet.ico"
  WriteRegStr HKCR "Regaarder.Sheet\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgsht and Explorer "New > Regaarder Spreadsheet"
  WriteRegStr HKCR ".rgsht" "" "Regaarder.Sheet"
  WriteRegStr HKCR ".rgsht" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgsht" "Content Type" "application/x-regaarder-sheet"
  WriteRegStr HKCR ".rgsht\ShellNew" "NullFile" ""
  WriteRegStr HKCR ".rgsht\ShellNew" "ItemName" "Regaarder Spreadsheet"
  WriteRegStr HKCR ".rgsht\ShellNew" "IconPath" "$INSTDIR\resources\icons\sheet.ico"

  ; Register ProgID for Regaarder Deck
  WriteRegStr HKCR "Regaarder.Deck" "" "Regaarder Presentation"
  WriteRegStr HKCR "Regaarder.Deck\DefaultIcon" "" "$INSTDIR\resources\icons\deck.ico"
  WriteRegStr HKCR "Regaarder.Deck\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgdck and Explorer "New > Regaarder Presentation"
  WriteRegStr HKCR ".rgdck" "" "Regaarder.Deck"
  WriteRegStr HKCR ".rgdck" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgdck" "Content Type" "application/x-regaarder-deck"
  WriteRegStr HKCR ".rgdck\ShellNew" "NullFile" ""
  WriteRegStr HKCR ".rgdck\ShellNew" "ItemName" "Regaarder Presentation"
  WriteRegStr HKCR ".rgdck\ShellNew" "IconPath" "$INSTDIR\resources\icons\deck.ico"

  ; Register ProgID for Regaarder Whiteboard
  WriteRegStr HKCR "Regaarder.Whiteboard" "" "Regaarder Whiteboard"
  WriteRegStr HKCR "Regaarder.Whiteboard\DefaultIcon" "" "$INSTDIR\resources\icons\whiteboard.ico"
  WriteRegStr HKCR "Regaarder.Whiteboard\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'

  ; Register .rgwbd and Explorer "New > Regaarder Whiteboard"
  WriteRegStr HKCR ".rgwbd" "" "Regaarder.Whiteboard"
  WriteRegStr HKCR ".rgwbd" "PerceivedType" "Document"
  WriteRegStr HKCR ".rgwbd" "Content Type" "application/x-regaarder-whiteboard"
  WriteRegStr HKCR ".rgwbd\ShellNew" "NullFile" ""
  WriteRegStr HKCR ".rgwbd\ShellNew" "ItemName" "Regaarder Whiteboard"
  WriteRegStr HKCR ".rgwbd\ShellNew" "IconPath" "$INSTDIR\resources\icons\whiteboard.ico"

  ; Notify Windows Shell of file association changes
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend

!macro customUnInstall
  DetailPrint "Cleaning up regaarder:// protocol handler, context menus, and ShellNew associations..."
  DeleteRegKey HKCR "regaarder"
  DeleteRegKey HKCR "*\shell\RegaarderWorkspace"
  DeleteRegKey HKCR "Regaarder.Document"
  DeleteRegKey HKCR ".rgdoc\ShellNew"
  DeleteRegKey HKCR "Regaarder.Sheet"
  DeleteRegKey HKCR ".rgsht\ShellNew"
  DeleteRegKey HKCR "Regaarder.Deck"
  DeleteRegKey HKCR ".rgdck\ShellNew"
  DeleteRegKey HKCR "Regaarder.Whiteboard"
  DeleteRegKey HKCR ".rgwbd\ShellNew"

  ; Notify Windows Shell of association removal
  System::Call 'shell32.dll::SHChangeNotify(i, i, i, i) v (0x08000000, 0, 0, 0)'
!macroend
