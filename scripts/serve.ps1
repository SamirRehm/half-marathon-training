# Local dev server for the Split dashboard (Windows, PowerShell 5.1+, no Python/Node needed).
# Serves public/ first and falls back to data/ (so ./daily_log.json, ./activities.json,
# ./athlete.json, ./wellness.json and ./streams/* resolve exactly like the deployed site,
# where the GitHub Pages workflow copies data/ into public/ at build time).
# Usage: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/serve.ps1 [-Port 8017]
param([int]$Port = 8017)

$root   = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$data   = Join-Path $root 'data'

$mime = @{
  '.html'='text/html; charset=utf-8'; '.json'='application/json; charset=utf-8'
  '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8'
  '.svg'='image/svg+xml'; '.png'='image/png'; '.ico'='image/x-icon'
  '.woff2'='font/woff2'; '.txt'='text/plain; charset=utf-8'; '.csv'='text/csv; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Split dev server: http://localhost:$Port/  (public/ with data/ fallback; Ctrl+C to stop)"

while ($listener.IsListening) {
  try { $ctx = $listener.GetContext() } catch { break }
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $path = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath.TrimStart('/'))
    if ($path -eq '') { $path = 'index.html' }
    if ($path -match '\.\.') { $res.StatusCode = 400; $res.Close(); continue }
    $candidates = @((Join-Path $public $path), (Join-Path $data $path))
    $file = $candidates | Where-Object { Test-Path $_ -PathType Leaf } | Select-Object -First 1
    if ($file) {
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $res.Headers.Add('Cache-Control','no-store')
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $res.ContentLength64 = $bytes.Length
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host ("200 {0}" -f $req.Url.AbsolutePath)
    } else {
      $res.StatusCode = 404
      Write-Host ("404 {0}" -f $req.Url.AbsolutePath)
    }
  } catch {
    try { $res.StatusCode = 500 } catch {}
    Write-Host ("ERR {0}: {1}" -f $req.Url.AbsolutePath, $_.Exception.Message)
  } finally {
    try { $res.Close() } catch {}
  }
}
