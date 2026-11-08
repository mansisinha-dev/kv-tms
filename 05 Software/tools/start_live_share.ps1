# KV-TMS Live Public URL Sharer
$ErrorActionPreference = "SilentlyContinue"

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "         KISS VOCATIONAL TRAINING MANAGEMENT SYSTEM (KV-TMS)" -ForegroundColor Yellow
Write-Host "                       LIVE PUBLIC URL GENERATOR" -ForegroundColor Cyan
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $scriptDir) { $scriptDir = "C:\Users\hp\OneDrive\Desktop\KISS Vocational Training Management System\05 Software\tools" }
$baseDir = Split-Path -Parent (Split-Path -Parent $scriptDir)
if (-not $baseDir) { $baseDir = "C:\Users\hp\OneDrive\Desktop\KISS Vocational Training Management System" }

$cloudflaredPath = Join-Path $scriptDir "cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    $cloudflaredPath = Join-Path $baseDir "scratch\cloudflared.exe"
}

# 1. Check if backend port 8080 is active
$backendListening = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if (-not $backendListening) {
    Write-Host "[1/3] Starting Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
    $javaPath = "C:\Program Files\Java\jdk-26.0.1\bin\java.exe"
    $jarPath = Join-Path $baseDir "05 Software\kv-tms\target\kv-tms-0.0.1-SNAPSHOT.jar"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$baseDir\05 Software\kv-tms`" && `"$javaPath`" -jar `"$jarPath`"" -WindowStyle Minimized
    Start-Sleep -Seconds 3
} else {
    Write-Host "[1/3] Backend is already active on Port 8080." -ForegroundColor Green
}

# 2. Check if frontend port 5173 is active
$frontendListening = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue
if (-not $frontendListening) {
    Write-Host "[2/3] Starting Vite Frontend Server (Port 5173)..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k cd /d `"$baseDir\05 Software\frontend`" && npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 3
} else {
    Write-Host "[2/3] Frontend is already active on Port 5173." -ForegroundColor Green
}

# 3. Start Cloudflare Quick Tunnel
Write-Host "[3/3] Establishing secure public HTTPS tunnel with Cloudflare..." -ForegroundColor Yellow
$logFile = Join-Path $scriptDir "tunnel.log"
if (Test-Path $logFile) { Remove-Item $logFile -Force }

$proc = Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel --url http://localhost:5173 --logfile `"$logFile`"" -PassThru -WindowStyle Hidden

# Wait for URL to appear in log
$publicUrl = $null
for ($i = 0; $i -lt 35; $i++) {
    Start-Sleep -Milliseconds 600
    if (Test-Path $logFile) {
        $content = Get-Content $logFile -Raw -ErrorAction SilentlyContinue
        if ($content -match '(https:\/\/[a-z0-9\-]+\.trycloudflare\.com)') {
            $publicUrl = $matches[1]
            break
        }
    }
}

Clear-Host
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host "                     YOUR LIVE WEBSITE IS READY TO SHARE!                      " -ForegroundColor White -BackgroundColor DarkGreen
Write-Host "===============================================================================" -ForegroundColor Green
Write-Host ""
if ($publicUrl) {
    Set-Clipboard -Value $publicUrl
    Write-Host " >> PUBLIC URL FOR YOUR TEACHER (Copied to Clipboard!):" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    $publicUrl" -ForegroundColor Cyan -BackgroundColor Black
    Write-Host ""
    Write-Host "  * You can paste (Ctrl+V) this link directly into WhatsApp, Email, or SMS." -ForegroundColor White
    Write-Host "  * Your teacher can open this link from ANY phone, laptop, or tablet anywhere!" -ForegroundColor White
    Write-Host "  * Full system (Frontend, Backend, Database, Reports) is connected through this link." -ForegroundColor White
} else {
    Write-Host "Could not automatically extract URL within 20s. Please inspect: $logFile" -ForegroundColor Red
}

Write-Host ""
# Also display local Wi-Fi IP
$localIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty IPAddress -First 1)
if ($localIP) {
    Write-Host " >> LOCAL CAMPUS WI-FI URL (If teacher is connected to the same Wi-Fi network):" -ForegroundColor Gray
    Write-Host "    http://${localIP}:5173/" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "-------------------------------------------------------------------------------" -ForegroundColor Gray
Write-Host "NOTE: Keep this window open while your teacher is testing the website." -ForegroundColor Yellow
Write-Host "Press [CTRL + C] or close this window when done to stop the live link." -ForegroundColor Gray
Write-Host "-------------------------------------------------------------------------------" -ForegroundColor Gray

# Keep script running to keep tunnel alive
try {
    while (-not $proc.HasExited) {
        Start-Sleep -Seconds 1
    }
} finally {
    if (-not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}
