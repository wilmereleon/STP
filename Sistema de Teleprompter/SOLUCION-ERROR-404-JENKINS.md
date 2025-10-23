# ⚠️ Solución al Error 404 de Jenkins

## Problema
Al acceder a `http://localhost:8080` aparece:
```
HTTP ERROR 404 Not Found
URI: http://localhost:8080/
STATUS: 404
MESSAGE: Not Found
```

## Causa
Jenkins está configurado con el **contexto path `/jenkins`** en lugar de la raíz `/`.

Esto se ve en los logs:
```
Started oeje9n.ContextHandler$CoreContextHandler@25a5c7db{Jenkins v2.528.1,/jenkins,...}
```

## ✅ Solución

### Usar la URL Correcta:
```
❌ http://localhost:8080          (Error 404)
✅ http://localhost:8080/jenkins  (Funciona)
```

### Abrir Jenkins Automáticamente:
```powershell
Start-Process "http://localhost:8080/jenkins"
```

---

## 🔧 Opción: Cambiar a Raíz (Opcional)

Si prefieres usar `http://localhost:8080` sin `/jenkins`:

### 1. Modificar docker-compose.yml

```yaml
jenkins:
  image: jenkins/jenkins:lts
  container_name: teleprompter-jenkins
  environment:
    - JENKINS_OPTS=--prefix=   # <-- Agregar esta línea
  ports:
    - "8080:8080"
    - "50000:50000"
```

### 2. Reiniciar contenedor
```powershell
docker-compose down jenkins
docker-compose up -d jenkins
```

### 3. Esperar 2 minutos y acceder
```
http://localhost:8080
```

---

## 📌 URL Final Recomendada

**Mantener la configuración actual y usar:**
```
http://localhost:8080/jenkins
```

**Ventajas:**
- ✅ No requiere modificar configuración
- ✅ Permite correr múltiples servicios en puerto 8080
- ✅ Más seguro (no expone en raíz)

---

## 🚀 Próximos Pasos

1. Abrir: **http://localhost:8080/jenkins**
2. Pegar contraseña: `a783646f9cff4011b8dcf6423184ca10`
3. Click en **"Continue"**
4. Seleccionar **"Install suggested plugins"**
5. Crear usuario admin
6. ¡Listo!

---

## 📝 Actualización de URLs

Todas las URLs de Jenkins ahora incluyen `/jenkins`:

- **Dashboard:** http://localhost:8080/jenkins
- **New Job:** http://localhost:8080/jenkins/newJob
- **Manage:** http://localhost:8080/jenkins/manage
- **Build History:** http://localhost:8080/jenkins/view/all/builds

---

## Script de Validación Actualizado

```powershell
# Validar Jenkins con URL correcta
$url = "http://localhost:8080/jenkins"

try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Jenkins accesible en $url" -ForegroundColor Green
        Start-Process $url
    }
} catch {
    Write-Host "❌ Error al acceder a Jenkins" -ForegroundColor Red
    Write-Host "   URL intentada: $url" -ForegroundColor Gray
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}
```

---

## 🔍 Verificar Configuración Actual

```powershell
# Ver configuración de Jenkins
docker exec teleprompter-jenkins cat /etc/default/jenkins | grep JENKINS_ARGS

# Ver logs del contexto
docker logs teleprompter-jenkins | grep "ContextHandler"
```

**Output esperado:**
```
Started ...{Jenkins v2.528.1,/jenkins,...}
```

Esto confirma que Jenkins usa el contexto `/jenkins`.

---

## ✅ Solución Aplicada

La URL correcta ya está abierta en tu navegador:
```
http://localhost:8080/jenkins
```

Continúa con la configuración inicial de Jenkins.
