param(
  [int]$Port = 4173
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Host "Portfolio preview running at http://localhost:$Port"
Write-Host "Press Ctrl+C to stop."

$contentTypes = @{
  ".css"  = "text/css; charset=utf-8"
  ".html" = "text/html; charset=utf-8"
  ".ico"  = "image/x-icon"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".pdf"  = "application/pdf"
  ".png"  = "image/png"
  ".svg"  = "image/svg+xml"
  ".txt"  = "text/plain; charset=utf-8"
  ".webp" = "image/webp"
}

function Send-Response {
  param(
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body,
    [string]$ContentType
  )

  $headers = @(
    "HTTP/1.1 $StatusCode $StatusText",
    "Content-Type: $ContentType",
    "Content-Length: $($Body.Length)",
    "Connection: close",
    ""
  ) -join "`r`n"

  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers + "`r`n")
  $Stream.Write($headerBytes, 0, $headerBytes.Length)
  $Stream.Write($Body, 0, $Body.Length)
  $Stream.Flush()
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)

      $requestLine = $reader.ReadLine()
      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
        Send-Response -Stream $stream -StatusCode 400 -StatusText "Bad Request" -Body $body -ContentType "text/plain; charset=utf-8"
        continue
      }

      while ($reader.Peek() -ge 0) {
        $line = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($line)) {
          break
        }
      }

      $parts = $requestLine.Split(" ")
      $path = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
      $relativePath = [System.Uri]::UnescapeDataString($path.Split("?")[0].TrimStart('/'))

      if ([string]::IsNullOrWhiteSpace($relativePath)) {
        $relativePath = "index.html"
      }

      $filePath = Join-Path $root $relativePath
      if ((Test-Path $filePath) -and (Get-Item $filePath).PSIsContainer) {
        $filePath = Join-Path $filePath "index.html"
      }

      if (-not (Test-Path $filePath)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        Send-Response -Stream $stream -StatusCode 404 -StatusText "Not Found" -Body $body -ContentType "text/plain; charset=utf-8"
        continue
      }

      $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
      $contentType = $contentTypes[$extension]
      if (-not $contentType) {
        $contentType = "application/octet-stream"
      }

      $body = [System.IO.File]::ReadAllBytes($filePath)
      Send-Response -Stream $stream -StatusCode 200 -StatusText "OK" -Body $body -ContentType $contentType
    }
    finally {
      if ($reader) {
        $reader.Dispose()
      }

      if ($stream) {
        $stream.Dispose()
      }

      $client.Close()
    }
  }
}
finally {
  $listener.Stop()
}
