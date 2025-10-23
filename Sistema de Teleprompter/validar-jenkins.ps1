# =========================================
# Script de Validación Rápida de Jenkins
# =========================================

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  VALIDACIÓN DE JENKINS" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# 1. Verificar que el contenedor existe y está corriendo
Write-Host "`n[1/5] Verificando contenedor Jenkins..." -ForegroundColor Yellow
$container = docker ps --filter "name=teleprompter-jenkins" --format "{{.Status}}"

if ($container -like "*Up*") {
    Write-Host "✅ Jenkins está corriendo" -ForegroundColor Green
    Write-Host "   Estado: $container" -ForegroundColor Gray
} else {
    Write-Host "❌ Jenkins NO está corriendo" -ForegroundColor Red
    Write-Host "   Iniciando contenedor..." -ForegroundColor Yellow
    docker-compose up -d jenkins
    Start-Sleep -Seconds 10
}

# 2. Verificar puerto 8080
Write-Host "`n[2/5] Verificando puerto 8080..." -ForegroundColor Yellow
$portCheck = Test-NetConnection -ComputerName localhost -Port 8080 -WarningAction SilentlyContinue

if ($portCheck.TcpTestSucceeded) {
    Write-Host "✅ Puerto 8080 está abierto" -ForegroundColor Green
} else {
    Write-Host "⚠️  Puerto 8080 no responde (Jenkins puede estar iniciando)" -ForegroundColor Yellow
    Write-Host "   Espera 1-2 minutos para que Jenkins termine de iniciar" -ForegroundColor Gray
}

# 3. Obtener contraseña inicial
Write-Host "`n[3/5] Obteniendo contraseña inicial..." -ForegroundColor Yellow
try {
    $password = docker exec teleprompter-jenkins cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
    
    if ($password) {
        Write-Host "Contraseña obtenida:" -ForegroundColor Green
        Write-Host ""
        Write-Host "   ========================================" -ForegroundColor Cyan
        Write-Host "   PASSWORD: $password" -ForegroundColor Yellow
        Write-Host "   ========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Copia esta contraseña para usarla en http://localhost:8080" -ForegroundColor Gray
        
        # Copiar al portapapeles
        Set-Clipboard -Value $password
        Write-Host "   Contraseña copiada al portapapeles" -ForegroundColor Green
    } else {
        Write-Host "Jenkins ya fue configurado (no hay contraseña inicial)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  No se pudo obtener la contraseña (Jenkins puede estar configurado)" -ForegroundColor Yellow
}

# 4. Verificar logs
Write-Host "`n[4/5] Verificando logs de Jenkins..." -ForegroundColor Yellow
$logs = docker logs teleprompter-jenkins --tail=5 2>&1

if ($logs -like "*Jenkins is fully up and running*") {
    Write-Host "✅ Jenkins está completamente inicializado" -ForegroundColor Green
} elseif ($logs -like "*Starting Jenkins*") {
    Write-Host "⏳ Jenkins está iniciando..." -ForegroundColor Yellow
} else {
    Write-Host "📋 Últimas 5 líneas de logs:" -ForegroundColor Gray
    docker logs teleprompter-jenkins --tail=5
}

# 5. Verificar acceso web
Write-Host "`n[5/5] Verificando acceso web..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Jenkins accesible en http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Jenkins aún no responde (puede estar iniciando)" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Resumen final
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor White
Write-Host "   1. Abrir navegador: http://localhost:8080" -ForegroundColor Gray
Write-Host "   2. Pegar la contraseña copiada" -ForegroundColor Gray
Write-Host "   3. Click en 'Install suggested plugins'" -ForegroundColor Gray
Write-Host "   4. Crear usuario admin" -ForegroundColor Gray
Write-Host "   5. Listo para usar Jenkins!" -ForegroundColor Gray

Write-Host ""
Write-Host "Documentacion completa:" -ForegroundColor White
Write-Host "   GUIA-VALIDACION-JENKINS.md" -ForegroundColor Gray

Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor White
Write-Host "   Ver logs:     docker logs -f teleprompter-jenkins" -ForegroundColor Gray
Write-Host "   Reiniciar:    docker-compose restart jenkins" -ForegroundColor Gray
Write-Host "   Detener:      docker-compose stop jenkins" -ForegroundColor Gray

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
