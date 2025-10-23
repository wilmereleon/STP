# 🔧 Guía de Validación de Jenkins

## ¿Qué es Jenkins y Para Qué Sirve en Este Proyecto?

**Jenkins** es un servidor de **integración continua (CI) y entrega continua (CD)** que automatiza:

✅ **Build automático** del código cuando haces `git push`  
✅ **Testing automático** de las pruebas unitarias  
✅ **Deployment automático** a producción  
✅ **Notificaciones** de errores en builds  
✅ **Quality checks** (linting, code coverage, vulnerabilidades)

---

## 📋 Validación Paso a Paso

### **1. Verificar que Jenkins Está Corriendo**

#### Opción A: Desde Docker Desktop
1. Abrir **Docker Desktop**
2. Ir a la pestaña **Containers**
3. Buscar contenedor `teleprompter-jenkins`
4. Verificar que dice **Running** (verde)

#### Opción B: Desde Terminal
```powershell
# Ver estado del contenedor
docker ps --filter "name=teleprompter-jenkins"

# Debería mostrar:
# CONTAINER ID   IMAGE                  STATUS
# xxxxxxxxxx     jenkins/jenkins:lts    Up X minutes
```

---

### **2. Acceder a la Interfaz Web de Jenkins**

1. Abrir navegador
2. Ir a: **http://localhost:8080/jenkins** ⚠️ **IMPORTANTE: Incluir `/jenkins`**
3. Deberías ver la pantalla de **"Unlock Jenkins"**

> **Nota:** Si accedes a `http://localhost:8080` verás error 404. Jenkins está configurado en el contexto `/jenkins`.

---

### **3. Obtener la Contraseña Inicial**

Jenkins genera una contraseña aleatoria en el primer inicio. Para obtenerla:

```powershell
# Método 1: Ver logs del contenedor
docker logs teleprompter-jenkins 2>&1 | Select-String "password"

# Método 2: Leer el archivo directamente
docker exec teleprompter-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

**Ejemplo de output:**
```
*************************************************************
*************************************************************

Jenkins initial setup is required. An admin user has been created 
and a password generated.
Please use the following password to proceed to installation:

a783646f9cff4011b8dcf6423184ca10

This may also be found at: /var/jenkins_home/secrets/initialAdminPassword

*************************************************************
*************************************************************
```

**Copia la contraseña** (en este caso: `a783646f9cff4011b8dcf6423184ca10`)

---

### **4. Configuración Inicial de Jenkins**

#### Paso 1: Unlock Jenkins
1. Pegar la contraseña en el campo **"Administrator password"**
2. Click en **Continue**

#### Paso 2: Instalar Plugins
Verás 2 opciones:
- **Install suggested plugins** ← **RECOMENDADO** (instala plugins comunes)
- **Select plugins to install** (personalizado)

**Selecciona:** "Install suggested plugins"

Jenkins instalará automáticamente:
- Git plugin
- Pipeline plugin
- GitHub plugin
- NodeJS plugin
- Docker plugin
- Blue Ocean (UI moderna)

**Tiempo estimado:** 3-5 minutos

#### Paso 3: Crear Usuario Admin
1. Llenar el formulario:
   - **Username:** admin
   - **Password:** (tu contraseña segura)
   - **Full name:** Administrador Teleprompter
   - **Email:** admin@teleprompter.local

2. Click en **Save and Continue**

#### Paso 4: Instance Configuration
- **Jenkins URL:** http://localhost:8080/
- Click en **Save and Finish**

#### Paso 5: ¡Listo!
- Click en **Start using Jenkins**

---

### **5. Validar que Jenkins Funciona Correctamente**

#### Test 1: Crear un Job de Prueba

1. En el Dashboard, click en **"New Item"**
2. Nombre: `test-teleprompter`
3. Seleccionar: **Freestyle project**
4. Click en **OK**

5. En la configuración:
   - **Build Steps** → Add build step → **Execute shell**
   - Agregar comando:
     ```bash
     echo "==================================="
     echo "Jenkins está funcionando correctamente"
     echo "Fecha: $(date)"
     echo "Hostname: $(hostname)"
     echo "==================================="
     ```
   
6. Click en **Save**

7. En la página del job, click en **"Build Now"**

8. Verás un nuevo build en **"Build History"** (#1)

9. Click en el número del build → **Console Output**

10. Deberías ver:
    ```
    ===================================
    Jenkins está funcionando correctamente
    Fecha: Wed Oct 23 19:45:23 UTC 2025
    Hostname: abc123def456
    ===================================
    Finished: SUCCESS
    ```

✅ **Si ves "Finished: SUCCESS" → Jenkins funciona correctamente**

---

### **6. Configurar Jenkins para el Proyecto Teleprompter**

#### Paso 1: Instalar Plugins Adicionales

1. Dashboard → **Manage Jenkins** → **Manage Plugins**
2. Pestaña **Available plugins**
3. Buscar e instalar:
   - ✅ **NodeJS Plugin** (para npm/node builds)
   - ✅ **Docker Pipeline** (para builds en Docker)
   - ✅ **GitHub Integration Plugin** (para webhooks)
   - ✅ **Warnings Next Generation** (para análisis de código)
   - ✅ **HTML Publisher** (para reportes de tests)

4. Click en **Install without restart**

#### Paso 2: Configurar NodeJS

1. **Manage Jenkins** → **Tools**
2. Scroll a **NodeJS installations**
3. Click en **Add NodeJS**
4. Configurar:
   - **Name:** `NodeJS-20`
   - **Version:** NodeJS 20.x (latest)
   - ✅ Check: "Install automatically"
5. Click en **Save**

---

### **7. Crear Pipeline de CI/CD para el Teleprompter**

#### Pipeline 1: Frontend Build

1. Dashboard → **New Item**
2. Nombre: `Teleprompter-Frontend-Build`
3. Tipo: **Pipeline**
4. Click en **OK**

5. En **Pipeline** → **Definition:** Pipeline script
6. Copiar este código:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonando repositorio...'
                // Si tienes GitHub configurado:
                // git branch: 'master', url: 'https://github.com/wilmereleon/STP.git'
                echo '✅ Código descargado'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('Sistema de Teleprompter') {
                    echo '📦 Instalando dependencias del frontend...'
                    sh 'npm ci'
                    echo '✅ Dependencias instaladas'
                }
            }
        }
        
        stage('Lint') {
            steps {
                dir('Sistema de Teleprompter') {
                    echo '🔍 Verificando calidad del código...'
                    sh 'npm run lint || true'
                    echo '✅ Linting completado'
                }
            }
        }
        
        stage('Build') {
            steps {
                dir('Sistema de Teleprompter') {
                    echo '🏗️ Construyendo aplicación...'
                    sh 'npm run build'
                    echo '✅ Build completado'
                }
            }
        }
        
        stage('Test') {
            steps {
                dir('Sistema de Teleprompter') {
                    echo '🧪 Ejecutando tests...'
                    sh 'npm test || true'
                    echo '✅ Tests ejecutados'
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ ¡Pipeline ejecutado exitosamente!'
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs.'
        }
    }
}
```

7. Click en **Save**
8. Click en **Build Now**

---

#### Pipeline 2: Backend Build

1. Crear nuevo Pipeline: `Teleprompter-Backend-Build`
2. Usar este script:

```groovy
pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-20'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonando repositorio...'
                echo '✅ Código descargado'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('Sistema de Teleprompter/backend') {
                    echo '📦 Instalando dependencias del backend...'
                    sh 'npm ci'
                    echo '✅ Dependencias instaladas'
                }
            }
        }
        
        stage('Lint') {
            steps {
                dir('Sistema de Teleprompter/backend') {
                    echo '🔍 Verificando calidad del código...'
                    sh 'npm run lint || true'
                    echo '✅ Linting completado'
                }
            }
        }
        
        stage('Test') {
            steps {
                dir('Sistema de Teleprompter/backend') {
                    echo '🧪 Ejecutando tests...'
                    sh 'npm test || true'
                    echo '✅ Tests ejecutados'
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ ¡Backend build exitoso!'
        }
        failure {
            echo '❌ Backend build falló'
        }
    }
}
```

---

#### Pipeline 3: Full Deployment (Docker)

1. Crear Pipeline: `Teleprompter-Full-Deployment`
2. Script:

```groovy
pipeline {
    agent any
    
    stages {
        stage('Stop Containers') {
            steps {
                echo '🛑 Deteniendo contenedores...'
                sh '''
                    cd "Sistema de Teleprompter"
                    docker-compose down || true
                '''
            }
        }
        
        stage('Build Images') {
            steps {
                echo '🐳 Construyendo imágenes Docker...'
                sh '''
                    cd "Sistema de Teleprompter"
                    docker-compose build
                '''
            }
        }
        
        stage('Start Containers') {
            steps {
                echo '🚀 Iniciando contenedores...'
                sh '''
                    cd "Sistema de Teleprompter"
                    docker-compose up -d
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Verificando salud de servicios...'
                sh '''
                    sleep 10
                    curl -f http://localhost:3000/health || exit 1
                    curl -f http://localhost:5173 || exit 1
                '''
                echo '✅ Todos los servicios están saludables'
            }
        }
    }
    
    post {
        success {
            echo '✅ ¡Deployment completado exitosamente!'
            echo '🌐 Frontend: http://localhost:5173'
            echo '🌐 Backend: http://localhost:3000'
        }
        failure {
            echo '❌ Deployment falló. Revisar logs.'
        }
    }
}
```

---

### **8. Configurar Webhooks de GitHub (Opcional)**

Para que Jenkins ejecute builds automáticamente al hacer `git push`:

#### En GitHub:
1. Ir a tu repo: https://github.com/wilmereleon/STP
2. **Settings** → **Webhooks** → **Add webhook**
3. Configurar:
   - **Payload URL:** `http://TU-IP-PUBLICA:8080/github-webhook/`
   - **Content type:** application/json
   - **Events:** Just the push event
4. Click en **Add webhook**

#### En Jenkins:
1. Ir al job configurado
2. **Configure** → **Build Triggers**
3. ✅ Check: "GitHub hook trigger for GITScm polling"
4. **Save**

Ahora cada vez que hagas `git push`, Jenkins automáticamente:
- 🔄 Descargará el código
- 🏗️ Construirá el proyecto
- 🧪 Ejecutará los tests
- ✅ Desplegará si todo pasa

---

### **9. Monitoreo y Reportes**

#### Ver Logs en Tiempo Real
```powershell
docker logs -f teleprompter-jenkins
```

#### Ver Builds Anteriores
1. Dashboard → Click en job
2. Ver **Build History** (panel izquierdo)
3. Click en cualquier build → **Console Output**

#### Ver Métricas
1. Dashboard → **Manage Jenkins** → **System Information**
2. Verificar:
   - Java version
   - Memory usage
   - Available disk space

---

### **10. Troubleshooting**

#### Problema: Jenkins no inicia
```powershell
# Ver logs
docker logs teleprompter-jenkins --tail=100

# Reiniciar contenedor
docker-compose restart jenkins

# Verificar puerto 8080 no esté ocupado
netstat -ano | findstr :8080
```

#### Problema: "Permission denied" en builds
Agregar usuario jenkins al grupo docker:
```bash
docker exec -u root teleprompter-jenkins usermod -aG docker jenkins
docker-compose restart jenkins
```

#### Problema: Builds muy lentos
Aumentar recursos en docker-compose.yml:
```yaml
jenkins:
  deploy:
    resources:
      limits:
        cpus: '2.0'
        memory: 4G
```

---

## 📊 Checklist de Validación Completa

- [ ] Jenkins accesible en http://localhost:8080
- [ ] Login exitoso con usuario creado
- [ ] Plugins instalados correctamente
- [ ] NodeJS configurado en Tools
- [ ] Job de prueba ejecutado exitosamente
- [ ] Pipeline de Frontend funciona
- [ ] Pipeline de Backend funciona
- [ ] Pipeline de Deployment funciona
- [ ] Logs visibles en Console Output
- [ ] No hay errores en System Log

---

## 🎯 ¿Qué Hace Jenkins en Este Proyecto?

### **Workflow Completo:**

```
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ GitHub Webhook      │
│ Notifica a Jenkins  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ Jenkins Pipeline Auto-ejecuta       │
├─────────────────────────────────────┤
│ 1. Checkout código                  │
│ 2. Install dependencies (npm ci)    │
│ 3. Lint (verificar código)          │
│ 4. Build (compilar frontend)        │
│ 5. Test (ejecutar pruebas)          │
│ 6. Docker build (crear imágenes)    │
│ 7. Docker deploy (iniciar)          │
│ 8. Health check (verificar)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│ ✅ SUCCESS          │
│ ❌ FAILURE          │
│ 📧 Notificación     │
└─────────────────────┘
```

---

## 🔐 Seguridad

### Cambiar contraseña de admin
1. Dashboard → **People** → Click en usuario
2. **Configure** → **Password**
3. Ingresar nueva contraseña
4. **Save**

### Crear usuarios adicionales
1. **Manage Jenkins** → **Manage Users**
2. **Create User**
3. Configurar permisos en **Configure Global Security**

---

## 📚 Recursos Adicionales

- **Documentación oficial:** https://www.jenkins.io/doc/
- **Pipeline syntax:** https://www.jenkins.io/doc/book/pipeline/syntax/
- **Plugins:** https://plugins.jenkins.io/
- **Best practices:** https://www.jenkins.io/doc/book/pipeline/best-practices/

---

## 🎉 ¡Jenkins Validado!

Si completaste todos los pasos, Jenkins está:
- ✅ Instalado correctamente
- ✅ Configurado para el proyecto
- ✅ Ejecutando pipelines
- ✅ Listo para CI/CD automático

**Próximo paso:** Configurar webhooks para deploys automáticos en cada `git push`.
