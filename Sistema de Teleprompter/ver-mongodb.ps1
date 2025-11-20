# Script para consultar MongoDB del Sistema de Teleprompter
# Uso: .\ver-mongodb.ps1

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CONSULTA DE MONGODB - TELEPROMPTER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ver usuarios
Write-Host "[1/5] Usuarios en la base de datos:" -ForegroundColor Yellow
docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "db.users.find({}, {name: 1, email: 1, role: 1}).toArray()"
Write-Host ""

# 2. Contar collections
Write-Host "[2/5] Estadísticas de collections:" -ForegroundColor Yellow
docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "print('Users: ' + db.users.countDocuments()); print('Scripts: ' + db.scripts.countDocuments()); print('RunOrders: ' + db.runorders.countDocuments()); print('Configurations: ' + db.configurations.countDocuments()); print('Macros: ' + db.macros.countDocuments());"
Write-Host ""

# 3. Ver scripts
Write-Host "[3/5] Scripts disponibles:" -ForegroundColor Yellow
docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "db.scripts.find({}, {title: 1, category: 1, status: 1}).toArray()"
Write-Host ""

# 4. Ver configuración
Write-Host "[4/5] Configuración del usuario admin:" -ForegroundColor Yellow
docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "db.configurations.find().toArray()"
Write-Host ""

# 5. Ver macros
Write-Host "[5/5] Macros configurados:" -ForegroundColor Yellow
docker exec teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin --quiet --eval "db.macros.find({}, {key: 1, action: 1, description: 1}).toArray()"
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "   CONEXION INTERACTIVA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para abrir shell interactivo de MongoDB:" -ForegroundColor White
Write-Host "docker exec -it teleprompter-mongo mongosh teleprompter -u admin -p admin123 --authenticationDatabase admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Comandos útiles una vez dentro:" -ForegroundColor White
Write-Host "  show collections                    - Ver todas las colecciones" -ForegroundColor Gray
Write-Host "  db.users.find().pretty()            - Ver todos los usuarios" -ForegroundColor Gray
Write-Host "  db.scripts.find().pretty()          - Ver todos los scripts" -ForegroundColor Gray
Write-Host "  db.users.findOne({email: 'admin@teleprompter.com'})  - Ver usuario admin" -ForegroundColor Gray
Write-Host "  exit                                - Salir del shell" -ForegroundColor Gray
Write-Host ""
