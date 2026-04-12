#!/usr/bin/env pwsh

# CreditBook Web Testing Script
# This script handles the testing workflow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CreditBook Web Testing - Phase 1: AUTH" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Expo web server..." -ForegroundColor Yellow
Write-Host "Please wait 30-60 seconds for Metro bundler to complete..." -ForegroundColor Yellow
Write-Host ""

# Start the web server in background
$process = Start-Process -FilePath "npm" -ArgumentList "run", "web" `
  -WorkingDirectory "C:\Users\Subrat\OneDrive\Desktop\creditbook" `
  -PassThru `
  -RedirectStandardOutput "web-server.log" `
  -RedirectStandardError "web-server-error.log"

$processId = $process.Id
Write-Host "Web server started with PID: $processId" -ForegroundColor Green
Write-Host "Logs: web-server.log and web-server-error.log" -ForegroundColor Gray
Write-Host ""

# Wait for server to be ready
Write-Host "Waiting for server to start (this may take 30-60 seconds)..." -ForegroundColor Yellow

$maxWait = 120  # 2 minutes
$waited = 0
$serverReady = $false

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 5
    $waited += 5
    
    # Check if process still running
    if (-not (Get-Process -Id $processId -ErrorAction SilentlyContinue)) {
        Write-Host "ERROR: Web server process died!" -ForegroundColor Red
        Write-Host "Check logs for details:" -ForegroundColor Red
        Get-Content "web-server-error.log" | Select-Object -Last 20
        exit 1
    }
    
    # Check if server is listening on port 19006
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:19006" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "✅ Server is ready!" -ForegroundColor Green
        }
    } catch {
        # Still waiting
        Write-Host "." -NoNewline
    }
}

if (-not $serverReady) {
    Write-Host ""
    Write-Host "⚠️  Server startup timeout after $maxWait seconds" -ForegroundColor Yellow
    Write-Host "But the process might still be starting. Check:" -ForegroundColor Yellow
    Write-Host "  http://localhost:19006" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ WEB SERVER READY FOR TESTING" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "TESTING INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:19006" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Follow the test flows in WEB_TEST_PLAN.md:" -ForegroundColor White
Write-Host "   - Phase 1: Authentication (Signup/Login)" -ForegroundColor Cyan
Write-Host "   - Phase 2: Core Features (Dashboard, Entries, Customers)" -ForegroundColor Cyan
Write-Host "   - Phase 3: Edge Cases (Validation, Long Text)" -ForegroundColor Cyan
Write-Host "   - Phase 4: Navigation (Tabs, Back, Deep Linking)" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Use test credentials:" -ForegroundColor White
Write-Host "   Email: tester@kredbook.io" -ForegroundColor Cyan
Write-Host "   Password: TestPass123!" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Document results as you test" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Press ENTER when testing is complete..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Read-Host

Write-Host ""
Write-Host "Thank you for testing!" -ForegroundColor Green
Write-Host "Stopping web server..." -ForegroundColor Yellow

# Stop the server
Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue

Write-Host "✅ Web server stopped" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Document any issues found" -ForegroundColor White
Write-Host "2. Create test report" -ForegroundColor White
Write-Host "3. Fix any critical bugs" -ForegroundColor White
