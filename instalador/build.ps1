# Monta o instalador da Forja 3D.
#   powershell -ExecutionPolicy Bypass -File instalador\build.ps1 [-Publicar]
# Saída: instalador\dist\Forja3D-Setup-<versão>.exe
# Precisa do Inno Setup 6 (winget install JRSoftware.InnoSetup) e do Node/npm neste PC.
# O Node deste PC vai embutido (runtime\node.exe) e o three.js também (vendor\three), então o app roda offline
# e quem instala não precisa de nada além do Chrome ou do Edge.
# -Publicar: anexa o setup na release v<versão> do GitHub (cria a release se ainda não existir). Precisa do gh logado.
param([switch]$Publicar)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$ver = (Get-Content "$root\VERSION" -Raw).Trim()
$build = Join-Path $PSScriptRoot 'build'
$app = Join-Path $build 'app'
Write-Host "== Forja 3D $ver =="

if (Test-Path $build) { Remove-Item -Recurse -Force $build }
New-Item -ItemType Directory -Force $app | Out-Null

# app: o mesmo index.html da versão web, só trocando o three.js do CDN pela cópia embutida
$html = [IO.File]::ReadAllText("$root\index.html")
$cdn = 'https://cdn.jsdelivr.net/npm/three@0.160.0/'
if (-not $html.Contains($cdn)) { throw "index.html não aponta mais para $cdn; atualize o build.ps1 junto." }
[IO.File]::WriteAllText("$app\index.html", $html.Replace($cdn, './vendor/three/'), (New-Object Text.UTF8Encoding $false))
foreach ($f in 'serve.js', 'abrir.js', 'README.md', 'VERSION') { Copy-Item "$root\$f" $app }
Copy-Item -Recurse "$root\assets" "$app\assets"
Copy-Item -Recurse "$root\vendor" "$app\vendor"

# three.js embutido: baixa a versão exata do npm e copia só os arquivos usados
$tmp = Join-Path $build 'npm'
New-Item -ItemType Directory -Force $tmp | Out-Null
npm install three@0.160.0 --prefix $tmp --no-audit --no-fund --no-save --loglevel=error
if ($LASTEXITCODE -ne 0) { throw 'npm install three falhou' }
node "$PSScriptRoot\vendor-three.js" "$tmp\node_modules\three" "$app\vendor\three"
if ($LASTEXITCODE -ne 0) { throw 'não deu pra copiar o three.js' }
Remove-Item -Recurse -Force $tmp

# Node embutido (o mesmo deste PC) + licença dele
New-Item -ItemType Directory -Force "$app\runtime" | Out-Null
$node = (Get-Command node).Source
Copy-Item $node "$app\runtime\node.exe"
$nodeVer = (& $node -v).Trim()
try { Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/nodejs/node/$nodeVer/LICENSE" -OutFile "$app\runtime\LICENSE-node.txt" }
catch { Write-Warning "Não baixou a licença do Node ($nodeVer); inclua runtime\LICENSE-node.txt à mão antes de distribuir." }
@"
Forja 3D usa software de terceiros:

- three.js 0.160.0 (licença MIT): vendor\three\LICENSE
- qrcode-generator 1.4.4 (licença MIT, Kazuhiko Arase): vendor\qrcode.min.js
- Node.js $nodeVer (licença MIT e outras): runtime\LICENSE-node.txt
"@ | Set-Content -Encoding UTF8 "$app\TERCEIROS.txt"

# compila
$iscc = @("${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe", "$env:ProgramFiles\Inno Setup 6\ISCC.exe", "$env:LocalAppData\Programs\Inno Setup 6\ISCC.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $iscc) { throw 'Inno Setup 6 não encontrado (winget install JRSoftware.InnoSetup)' }
& $iscc /Q "/DAppVersion=$ver" "/DSourceDir=$app" "/O$PSScriptRoot\dist" "$PSScriptRoot\setup.iss"
if ($LASTEXITCODE -ne 0) { throw 'Inno Setup falhou' }
$setup = "$PSScriptRoot\dist\Forja3D-Setup-$ver.exe"
Write-Host ("Pronto: $setup ({0:N1} MB)" -f ((Get-Item $setup).Length / 1MB))

if ($Publicar) {
  $repo = 'ailtonandrade/forja3d'
  $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  & gh release view "v$ver" -R $repo 2>&1 | Out-Null; $existe = $LASTEXITCODE -eq 0
  $ErrorActionPreference = $old
  if ($existe) { gh release upload "v$ver" $setup -R $repo --clobber }
  else { gh release create "v$ver" $setup -R $repo --title "Forja 3D $ver" --notes "Versão $ver. Baixe o Forja3D-Setup-$ver.exe e instale." }
  if ($LASTEXITCODE -ne 0) { throw 'não deu pra publicar no GitHub (veja a mensagem do gh acima)' }
  Write-Host "Publicado: https://github.com/$repo/releases/tag/v$ver"
}
