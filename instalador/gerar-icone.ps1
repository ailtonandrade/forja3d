# Desenha o ícone da Forja 3D (cubo cobre num quadrado escuro) e grava assets\icone.ico com vários tamanhos.
#   powershell -ExecutionPolicy Bypass -File instalador\gerar-icone.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path $PSScriptRoot -Parent
$out = Join-Path $root 'assets\icone.ico'
New-Item -ItemType Directory -Force (Split-Path $out) | Out-Null

$sizes = 16, 24, 32, 48, 64, 128, 256
$pngs = @()
foreach ($s in $sizes) {
  $bmp = New-Object Drawing.Bitmap $s, $s
  $g = [Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([Drawing.Color]::Transparent)
  $k = $s / 256.0
  $pt = { param($x, $y) New-Object Drawing.PointF ([single]($x * $k)), ([single]($y * $k)) }

  $r = 64 * $k; $x0 = 8 * $k; $w = 240 * $k
  $bg = New-Object Drawing.Drawing2D.GraphicsPath
  $bg.AddArc($x0, $x0, $r, $r, 180, 90); $bg.AddArc($x0 + $w - $r, $x0, $r, $r, 270, 90)
  $bg.AddArc($x0 + $w - $r, $x0 + $w - $r, $r, $r, 0, 90); $bg.AddArc($x0, $x0 + $w - $r, $r, $r, 90, 90); $bg.CloseFigure()
  $g.FillPath((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 30, 35, 43))), $bg)

  $top   = @((& $pt 128 46), (& $pt 204 90), (& $pt 128 134), (& $pt 52 90))
  $left  = @((& $pt 52 90), (& $pt 128 134), (& $pt 128 220), (& $pt 52 176))
  $right = @((& $pt 128 134), (& $pt 204 90), (& $pt 204 176), (& $pt 128 220))
  $g.FillPolygon((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 244, 178, 128))), [Drawing.PointF[]]$top)
  $g.FillPolygon((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 224, 138, 79))), [Drawing.PointF[]]$left)
  $g.FillPolygon((New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 160, 88, 44))), [Drawing.PointF[]]$right)
  if ($s -ge 48) {
    $pen = New-Object Drawing.Pen ([Drawing.Color]::FromArgb(255, 30, 35, 43)), ([single](5 * $k))
    $pen.LineJoin = 'Round'
    $g.DrawPolygon($pen, [Drawing.PointF[]]@((& $pt 128 46), (& $pt 204 90), (& $pt 204 176), (& $pt 128 220), (& $pt 52 176), (& $pt 52 90)))
    $g.DrawLines($pen, [Drawing.PointF[]]@((& $pt 52 90), (& $pt 128 134), (& $pt 204 90)))
    $g.DrawLine($pen, (& $pt 128 134), (& $pt 128 220))
  }
  $g.Dispose()
  $ms = New-Object IO.MemoryStream
  $bmp.Save($ms, [Drawing.Imaging.ImageFormat]::Png)
  $pngs += , ($ms.ToArray())
  $bmp.Dispose()
}

# .ico com as imagens PNG dentro (formato aceito desde o Windows Vista)
$fs = [IO.File]::Create($out)
$bw = New-Object IO.BinaryWriter $fs
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$sizes.Count)
$off = 6 + 16 * $sizes.Count
for ($i = 0; $i -lt $sizes.Count; $i++) {
  $d = [byte]($sizes[$i] % 256)
  $bw.Write($d); $bw.Write($d); $bw.Write([byte]0); $bw.Write([byte]0)
  $bw.Write([uint16]1); $bw.Write([uint16]32); $bw.Write([uint32]$pngs[$i].Length); $bw.Write([uint32]$off)
  $off += $pngs[$i].Length
}
foreach ($p in $pngs) { $bw.Write([byte[]]$p) }
$bw.Close()
Write-Host "Ícone gravado em $out"
