; Instalador da Forja 3D (Inno Setup 6). Não compile direto: rode instalador\build.ps1,
; que monta a pasta do app (com o Node e o three.js embutidos) e chama o compilador com a versão.
#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif
#ifndef SourceDir
  #define SourceDir "build\app"
#endif
#define AppName "Forja 3D"

[Setup]
AppId={{4F2B7D91-6C3E-4A58-B1D7-9E0C2A6F8B35}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} {#AppVersion}
AppPublisher=Forja 3D
AppPublisherURL=https://github.com/ailtonandrade/forja3d
DefaultDirName={localappdata}\Programs\{#AppName}
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
; instala só pro usuário, sem pedir administrador
PrivilegesRequired=lowest
OutputBaseFilename=Forja3D-Setup-{#AppVersion}
SetupIconFile={#SourceDir}\assets\icone.ico
UninstallDisplayIcon={app}\assets\icone.ico
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "pt"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\runtime\node.exe"; Parameters: """{app}\abrir.js"""; WorkingDir: "{app}"; IconFilename: "{app}\assets\icone.ico"; Flags: runminimized
Name: "{group}\Desinstalar {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\runtime\node.exe"; Parameters: """{app}\abrir.js"""; WorkingDir: "{app}"; IconFilename: "{app}\assets\icone.ico"; Flags: runminimized

[Run]
Filename: "{app}\runtime\node.exe"; Parameters: """{app}\abrir.js"""; WorkingDir: "{app}"; Description: "Abrir a {#AppName} agora"; Flags: postinstall nowait skipifsilent runhidden
; atualização automática (o app roda este setup com /ATUALIZACAO): no fim sobe só o servidor; a janela que já estava
; aberta percebe a versão nova e recarrega sozinha
Filename: "{app}\runtime\node.exe"; Parameters: """{app}\abrir.js"" --servidor"; WorkingDir: "{app}"; Flags: nowait runhidden; Check: EhAtualizacao

[Code]
// fecha o servidor da Forja desta instalação antes de atualizar ou desinstalar (o node.exe em uso trava a troca dos arquivos)
procedure StopAppNode();
var Code: Integer;
begin
  Exec('powershell.exe',
    '-NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.Path -like ''' +
    ExpandConstant('{app}') + '\runtime\*'' } | Stop-Process -Force"',
    '', SW_HIDE, ewWaitUntilTerminated, Code);
end;

function EhAtualizacao: Boolean;
begin
  Result := Pos('/ATUALIZACAO', UpperCase(GetCmdTail)) > 0;
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
  StopAppNode();
  Result := '';
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
begin
  if CurUninstallStep = usUninstall then StopAppNode();
end;
