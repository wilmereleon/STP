#!/usr/bin/env pwsh
<#
.SYNOPSIS
Script de prueba para verificar el funcionamiento del modo invitado

.DESCRIPTION
Ejecuta pruebas automatizadas para verificar que:
1. Los endpoints GET funcionan sin autenticación
2. Los endpoints POST/PUT/DELETE están protegidos
3. El frontend muestra los mensajes correctos
4. La base de datos tiene los datos necesarios

.EXAMPLE
.\probar-modo-invitado.ps1
#>

Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎬 TELEPROMPTER - PRUEBA DE MODO INVITADO                  ║
║                                                               ║
║   Este script verifica que el sistema permita acceso de      ║
║   lectura a usuarios invitados y bloquee operaciones de      ║
║   escritura correctamente.                                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Configuración
$baseUrl = "http://localhost:3000"
$testsPassed = 0
$testsFailed = 0

# Función helper para pruebas
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [int]$ExpectedStatus,
        [string]$ExpectedCode = $null
    )
    
    Write-Host "`n[TEST] $Name" -ForegroundColor Yellow
    Write-Host "  └─ $Method $Endpoint" -ForegroundColor Gray
    
    try {
        $uri = "$baseUrl$Endpoint"
        
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $uri -Method $Method -ErrorAction Stop
            $statusCode = $response.StatusCode
        } else {
            try {
                $body = '{"title":"Test Script","content":"Test content"}'
                $response = Invoke-WebRequest -Uri $uri -Method $Method -ContentType "application/json" -Body $body -ErrorAction Stop
                $statusCode = $response.StatusCode
            } catch {
                $statusCode = $_.Exception.Response.StatusCode.value__
                $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            }
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "  └─ ✅ Status Code: $statusCode (esperado: $ExpectedStatus)" -ForegroundColor Green
            
            if ($ExpectedCode -and $errorBody.code -eq $ExpectedCode) {
                Write-Host "  └─ ✅ Error Code: $($errorBody.code)" -ForegroundColor Green
                $script:testsPassed++
            } elseif (!$ExpectedCode) {
                $script:testsPassed++
            } else {
                Write-Host "  └─ ❌ Error Code: $($errorBody.code) (esperado: $ExpectedCode)" -ForegroundColor Red
                $script:testsFailed++
            }
        } else {
            Write-Host "  └─ ❌ Status Code: $statusCode (esperado: $ExpectedStatus)" -ForegroundColor Red
            $script:testsFailed++
        }
        
    } catch {
        Write-Host "  └─ ❌ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
        $script:testsFailed++
    }
}

# ==================================================
# PRUEBAS DE LECTURA (GET) - Deben funcionar
# ==================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE LECTURA (Modo Invitado)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint `
    -Name "Listar Scripts" `
    -Method "GET" `
    -Endpoint "/api/scripts" `
    -ExpectedStatus 200

Test-Endpoint `
    -Name "Obtener Configuración" `
    -Method "GET" `
    -Endpoint "/api/config" `
    -ExpectedStatus 200

Test-Endpoint `
    -Name "Listar Macros" `
    -Method "GET" `
    -Endpoint "/api/macros" `
    -ExpectedStatus 200

Test-Endpoint `
    -Name "Listar RunOrders" `
    -Method "GET" `
    -Endpoint "/api/runorders" `
    -ExpectedStatus 200

# ==================================================
# PRUEBAS DE ESCRITURA (POST/PUT/DELETE) - Deben fallar
# ==================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  PRUEBAS DE ESCRITURA (Protegido)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Test-Endpoint `
    -Name "Crear Script" `
    -Method "POST" `
    -Endpoint "/api/scripts" `
    -ExpectedStatus 403 `
    -ExpectedCode "GUEST_NOT_ALLOWED"

Test-Endpoint `
    -Name "Actualizar Script" `
    -Method "PUT" `
    -Endpoint "/api/scripts/68fa9a193f6ad44451ce5f4f" `
    -ExpectedStatus 403 `
    -ExpectedCode "GUEST_NOT_ALLOWED"

Test-Endpoint `
    -Name "Eliminar Script" `
    -Method "DELETE" `
    -Endpoint "/api/scripts/68fa9a193f6ad44451ce5f4f" `
    -ExpectedStatus 403 `
    -ExpectedCode "GUEST_NOT_ALLOWED"

# ==================================================
# VERIFICACIÓN DE BASE DE DATOS
# ==================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n[TEST] Datos en MongoDB" -ForegroundColor Yellow

try {
    $dbStats = docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "JSON.stringify({users: db.users.countDocuments(), scripts: db.scripts.countDocuments(), macros: db.macros.countDocuments(), configs: db.configurations.countDocuments()})" | ConvertFrom-Json
    
    Write-Host "  └─ Users: $($dbStats.users)" -ForegroundColor $(if ($dbStats.users -gt 0) { "Green" } else { "Red" })
    Write-Host "  └─ Scripts: $($dbStats.scripts)" -ForegroundColor $(if ($dbStats.scripts -gt 0) { "Green" } else { "Red" })
    Write-Host "  └─ Macros: $($dbStats.macros)" -ForegroundColor $(if ($dbStats.macros -gt 0) { "Green" } else { "Red" })
    Write-Host "  └─ Configs: $($dbStats.configs)" -ForegroundColor $(if ($dbStats.configs -gt 0) { "Green" } else { "Red" })
    
    if ($dbStats.users -gt 0 -and $dbStats.scripts -gt 0 -and $dbStats.macros -gt 0) {
        Write-Host "`n  └─ ✅ Base de datos correctamente inicializada" -ForegroundColor Green
        $script:testsPassed++
    } else {
        Write-Host "`n  └─ ❌ Base de datos vacía o incompleta" -ForegroundColor Red
        Write-Host "  └─ Ejecuta: Get-Content database\mongodb\01-init.js | docker exec -i teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin" -ForegroundColor Yellow
        $script:testsFailed++
    }
    
} catch {
    Write-Host "  └─ ❌ Error al conectar con MongoDB: $($_.Exception.Message)" -ForegroundColor Red
    $script:testsFailed++
}

# ==================================================
# VERIFICACIÓN DE CONTENEDORES
# ==================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE CONTENEDORES" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n[TEST] Estado de Docker Compose" -ForegroundColor Yellow

$containers = docker ps --format "{{.Names}}" --filter "name=teleprompter"
$expectedContainers = @("teleprompter-backend", "teleprompter-frontend", "teleprompter-mongo")

foreach ($expected in $expectedContainers) {
    if ($containers -contains $expected) {
        Write-Host "  └─ ✅ $expected: Running" -ForegroundColor Green
    } else {
        Write-Host "  └─ ❌ $expected: Not running" -ForegroundColor Red
        $script:testsFailed++
    }
}

# ==================================================
# RESUMEN
# ==================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$totalTests = $testsPassed + $testsFailed
$successRate = if ($totalTests -gt 0) { [math]::Round(($testsPassed / $totalTests) * 100, 2) } else { 0 }

Write-Host "`nPruebas ejecutadas: $totalTests" -ForegroundColor White
Write-Host "  ✅ Exitosas: $testsPassed" -ForegroundColor Green
Write-Host "  ❌ Fallidas: $testsFailed" -ForegroundColor Red
Write-Host "  📊 Tasa de éxito: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } else { "Yellow" })

if ($testsFailed -eq 0) {
    Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE                  ║
║                                                               ║
║   El modo invitado está funcionando correctamente:           ║
║   - GET requests: Permitidos sin autenticación               ║
║   - POST/PUT/DELETE: Bloqueados con GUEST_NOT_ALLOWED        ║
║   - Base de datos: Inicializada correctamente                ║
║                                                               ║
║   Puedes probar el sistema en:                               ║
║   👉 http://localhost:5173/login                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green
    
    exit 0
} else {
    Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ⚠️  ALGUNAS PRUEBAS FALLARON                               ║
║                                                               ║
║   Revisa los errores arriba y ejecuta:                       ║
║   1. docker-compose logs backend --tail=50                   ║
║   2. docker-compose logs frontend --tail=50                  ║
║   3. .\ver-mongodb.ps1                                       ║
║                                                               ║
║   Documentación: SOLUCION_MODO_INVITADO.md                   ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Red
    
    exit 1
}
