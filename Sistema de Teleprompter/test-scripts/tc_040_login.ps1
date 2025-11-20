# TC-040: Login válido (Login test)
# Env: Run from project root (PowerShell)
# This script will POST to the backend auth/login endpoint and save the response to test-scripts/results/tc_040_login_result.json

$ErrorActionPreference = 'Stop'
$resultsDir = "test-scripts\results"
if (-not (Test-Path $resultsDir)) { New-Item -Path $resultsDir -ItemType Directory | Out-Null }

$uri = 'http://localhost:3000/api/auth/login'
$body = @{ email = 'admin@teleprompter.com'; password = 'admin123' } | ConvertTo-Json

Write-Host "[*] Ejecutando TC-040: POST $uri"
try {
    $resp = Invoke-RestMethod -Uri $uri -Method Post -Body $body -ContentType 'application/json' -TimeoutSec 15
    $outFile = Join-Path $resultsDir 'tc_040_login_result.json'
    $resp | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding utf8

    if ($resp.accessToken) {
        Write-Host "[PASS] Login exitoso. AccessToken presente." -ForegroundColor Green
        Write-Host "User:" ($resp.user | ConvertTo-Json -Depth 3)
        exit 0
    } else {
        Write-Host "[FAIL] Login no devolvió accessToken." -ForegroundColor Red
        Write-Host "Response: " ($resp | ConvertTo-Json -Depth 5)
        exit 2
    }
} catch {
    Write-Host "[ERROR] Excepción al ejecutar petición: $_" -ForegroundColor Red
    $errFile = Join-Path $resultsDir 'tc_040_login_error.txt'
    "$_" | Out-File -FilePath $errFile -Encoding utf8
    exit 3
}