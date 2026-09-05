; Regaarder Compose - Custom NSIS Installer Script
; Registers 'regaarder://' protocol handler and ensures clean desktop/start menu integration

!macro customInstall
  DetailPrint "Registering regaarder:// protocol handler..."
  WriteRegStr HKCR "regaarder" "" "URL:Regaarder Compose Protocol"
  WriteRegStr HKCR "regaarder" "URL Protocol" ""
  WriteRegStr HKCR "regaarder\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "regaarder\shell" "" "open"
  WriteRegStr HKCR "regaarder\shell\open" "" ""
  WriteRegStr HKCR "regaarder\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend

!macro customUnInstall
  DetailPrint "Cleaning up regaarder:// protocol handler..."
  DeleteRegKey HKCR "regaarder"
!macroend
