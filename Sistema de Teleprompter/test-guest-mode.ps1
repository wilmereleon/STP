# Script de prueba del modo invitado
# Ejecuta: .\test-guest-mode.ps1

Write-Host "`n=== PRUEBA: Modo Invitado ===" -ForegroundColor Cyan

# Test 1: GET /api/scripts (debe funcionar)
Write-Host "`n[1] GET /api/scripts (sin token)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/scripts" -Method GET
    Write-Host "  OK - Scripts encontrados: $($result.scripts.Count)" -ForegroundColor Green
    if ($result.scripts.Count -gt 0) {
        Write-Host "  - $($result.scripts[0].title)" -ForegroundColor White
    }
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: GET /api/config (debe funcionar)
Write-Host "`n[2] GET /api/config (sin token)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/config" -Method GET
    Write-Host "  OK - Config: $($result.config.theme), $($result.config.fontSize)px" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: GET /api/macros (debe funcionar)
Write-Host "`n[3] GET /api/macros (sin token)" -ForegroundColor Yellow
try {
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/macros" -Method GET
    Write-Host "  OK - Macros encontrados: $($result.count)" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: POST /api/scripts (debe fallar con 403)
Write-Host "`n[4] POST /api/scripts (sin token - debe fallar)" -ForegroundColor Yellow
try {
    $body = @{ title = "Test Script"; content = "Test" } | ConvertTo-Json
    $result = Invoke-RestMethod -Uri "http://localhost:3000/api/scripts" -Method POST -Body $body -ContentType "application/json"
    Write-Host "  ERROR: POST deberia estar bloqueado!" -ForegroundColor Red
} catch {
    $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorDetails.code -eq "GUEST_NOT_ALLOWED") {
        Write-Host "  OK - Correctamente bloqueado: $($errorDetails.code)" -ForegroundColor Green
        Write-Host "  - $($errorDetails.message)" -ForegroundColor White
    } else {
        Write-Host "  ERROR: Codigo inesperado: $($errorDetails.code)" -ForegroundColor Red
    }
}

# Test 5: MongoDB
Write-Host "`n[5] Datos en MongoDB" -ForegroundColor Yellow
try {
    $stats = docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "print(db.users.countDocuments() + ',' + db.scripts.countDocuments() + ',' + db.macros.countDocuments())"
    $counts = $stats.Split(',')
    Write-Host "  OK - Users: $($counts[0]), Scripts: $($counts[1]), Macros: $($counts[2])" -ForegroundColor Green
} catch {
    Write-Host "  ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Contenedores
Write-Host "`n[6] Contenedores Docker" -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" --filter "name=teleprompter"
$expected = @("teleprompter-backend", "teleprompter-frontend", "teleprompter-mongo")
foreach ($name in $expected) {
    if ($containers -contains $name) {
        Write-Host "  OK - $name" -ForegroundColor Green
    } else {
        Write-Host "  ERROR - $name no esta corriendo" -ForegroundColor Red
    }
}

Write-Host "`n=== PRUEBA COMPLETADA ===" -ForegroundColor Cyan
Write-Host "`nURLs disponibles:" -ForegroundColor Yellow
Write-Host "  - Login: http://localhost:5173/login"
Write-Host "  - Productor: http://localhost:5173/producer"
Write-Host "  - Operador: http://localhost:5173/operator"
Write-Host "`n"
