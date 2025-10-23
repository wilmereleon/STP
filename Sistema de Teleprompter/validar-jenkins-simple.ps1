# Script de Validacion de Jenkins
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  VALIDACION DE JENKINS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. Verificar contenedor
Write-Host ""
Write-Host "[1/5] Verificando contenedor Jenkins..." -ForegroundColor Yellow
$container = docker ps --filter "name=teleprompter-jenkins" --format "{{.Status}}"

if ($container -like "*Up*") {
    Write-Host "OK - Jenkins esta corriendo" -ForegroundColor Green
    Write-Host "Estado: $container" -ForegroundColor Gray
} else {
    Write-Host "ERROR - Jenkins NO esta corriendo" -ForegroundColor Red
}

# 2. Verificar puerto
Write-Host ""
Write-Host "[2/5] Verificando puerto 8080..." -ForegroundColor Yellow
$portCheck = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue

if ($portCheck.TcpTestSucceeded) {
    Write-Host "OK - Puerto 8080 esta abierto" -ForegroundColor Green
} else {
    Write-Host "ADVERTENCIA - Puerto 8080 no responde" -ForegroundColor Yellow
}

# 3. Obtener contraseña
Write-Host ""
Write-Host "[3/5] Obteniendo contraseña inicial..." -ForegroundColor Yellow
try {
    $password = docker exec teleprompter-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
    
    if ($password) {
        Write-Host "OK - Contraseña obtenida" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "PASSWORD: $password" -ForegroundColor Yellow
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        
        Set-Clipboard -Value $password
        Write-Host "Contraseña copiada al portapapeles" -ForegroundColor Green
    } else {
        Write-Host "INFO - Jenkins ya configurado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "INFO - No se pudo obtener contraseña" -ForegroundColor Yellow
}

# 4. Ver logs
Write-Host ""
Write-Host "[4/5] Verificando logs..." -ForegroundColor Yellow
$logs = docker logs teleprompter-jenkins --tail=5 2>&1

if ($logs -like "*Jenkins is fully up and running*") {
    Write-Host "OK - Jenkins completamente inicializado" -ForegroundColor Green
} else {
    Write-Host "INFO - Jenkins iniciando..." -ForegroundColor Yellow
}

# 5. Verificar acceso web
Write-Host ""
Write-Host "[5/5] Verificando acceso web..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/jenkins" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    Write-Host "OK - Jenkins accesible en http://localhost:8080/jenkins" -ForegroundColor Green
} catch {
    Write-Host "ADVERTENCIA - Jenkins aun no responde" -ForegroundColor Yellow
}

# Resumen
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "1. Abrir: http://localhost:8080/jenkins (IMPORTANTE: incluir /jenkins)" -ForegroundColor Gray
Write-Host "2. Pegar la contraseña copiada" -ForegroundColor Gray
Write-Host "3. Install suggested plugins" -ForegroundColor Gray
Write-Host "4. Crear usuario admin" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentacion: GUIA-VALIDACION-JENKINS.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Abriendo Jenkins en navegador..." -ForegroundColor Yellow
Start-Process "http://localhost:8080/jenkins"
