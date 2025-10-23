#!/bin/bash

# ============================================
# SCRIPT DE INICIO RÁPIDO - TELEPROMPTER v2.0
# ============================================

echo "╔═══════════════════════════════════════════╗"
echo "║   🎬 TELEPROMPTER v2.0 - QUICK START     ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# ============================================
# 1. VERIFICAR PREREQUISITOS
# ============================================
echo "📋 Verificando prerequisitos..."
echo ""

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js instalado: $NODE_VERSION"
else
    print_error "Node.js no encontrado. Por favor instala Node.js 18+ LTS"
    echo "   Descargar desde: https://nodejs.org/"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm instalado: v$NPM_VERSION"
else
    print_error "npm no encontrado"
    exit 1
fi

# Verificar Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_success "Docker instalado: $DOCKER_VERSION"
    DOCKER_INSTALLED=true
else
    print_warning "Docker no encontrado. Se ejecutará en modo local sin contenedores"
    DOCKER_INSTALLED=false
fi

# Verificar Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_success "Docker Compose instalado: $COMPOSE_VERSION"
else
    if [ "$DOCKER_INSTALLED" = true ]; then
        print_warning "Docker Compose no encontrado"
    fi
fi

echo ""

# ============================================
# 2. PREGUNTAR MODO DE EJECUCIÓN
# ============================================
echo "🚀 ¿Cómo deseas ejecutar la aplicación?"
echo ""
echo "1) Docker (Recomendado - Ambiente completo)"
echo "2) Local (Desarrollo - Requiere MongoDB local)"
echo ""
read -p "Selecciona una opción [1-2]: " EXEC_MODE

case $EXEC_MODE in
    1)
        MODE="docker"
        ;;
    2)
        MODE="local"
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

echo ""

# ============================================
# 3. INSTALACIÓN DE DEPENDENCIAS
# ============================================
if [ "$MODE" = "local" ] || [ ! -f ".env" ]; then
    echo "📦 Instalando dependencias..."
    echo ""
    
    # Frontend
    print_info "Instalando dependencias del frontend..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencias frontend instaladas"
    else
        print_error "Error instalando dependencias frontend"
        exit 1
    fi
    
    echo ""
    
    # Backend
    print_info "Instalando dependencias del backend..."
    cd backend
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencias backend instaladas"
    else
        print_error "Error instalando dependencias backend"
        exit 1
    fi
    cd ..
    
    echo ""
fi

# ============================================
# 4. CONFIGURACIÓN
# ============================================
echo "⚙️  Configurando variables de entorno..."
echo ""

# Crear .env si no existe
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env creado desde .env.example"
    else
        print_warning ".env.example no encontrado, creando .env básico..."
        cat > .env <<EOF
# Frontend
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001

# Entorno
NODE_ENV=development
EOF
        print_success ".env creado"
    fi
else
    print_info ".env ya existe"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        print_success "backend/.env creado desde .env.example"
    else
        print_warning "backend/.env.example no encontrado, creando .env básico..."
        cat > backend/.env <<EOF
# Server
PORT=3000
WS_PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/teleprompter

# JWT
JWT_SECRET=teleprompter_secret_key_change_in_production

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
        print_success "backend/.env creado"
    fi
else
    print_info "backend/.env ya existe"
fi

echo ""

# ============================================
# 5. EJECUTAR APLICACIÓN
# ============================================
if [ "$MODE" = "docker" ]; then
    # ========================================
    # MODO DOCKER
    # ========================================
    echo "🐳 Iniciando con Docker Compose..."
    echo ""
    
    # Verificar si docker-compose.yml existe
    if [ ! -f "docker-compose.yml" ]; then
        print_error "docker-compose.yml no encontrado"
        exit 1
    fi
    
    # Limpiar contenedores previos
    print_info "Deteniendo contenedores previos (si existen)..."
    docker-compose down 2>/dev/null
    
    # Iniciar servicios
    print_info "Iniciando servicios (esto puede tomar unos minutos)..."
    docker-compose up -d --build
    
    if [ $? -eq 0 ]; then
        echo ""
        print_success "¡Aplicación iniciada exitosamente con Docker!"
        echo ""
        echo "╔═══════════════════════════════════════════╗"
        echo "║           SERVICIOS DISPONIBLES           ║"
        echo "╠═══════════════════════════════════════════╣"
        echo "║  📱 Frontend:  http://localhost:5173      ║"
        echo "║  🔧 Backend:   http://localhost:3000      ║"
        echo "║  💾 MongoDB:   localhost:27017            ║"
        echo "║  🔨 Jenkins:   http://localhost:8080      ║"
        echo "╚═══════════════════════════════════════════╝"
        echo ""
        print_info "Ver logs: docker-compose logs -f"
        print_info "Detener: docker-compose down"
        print_info "Reiniciar: docker-compose restart"
    else
        print_error "Error al iniciar servicios con Docker"
        exit 1
    fi
    
else
    # ========================================
    # MODO LOCAL
    # ========================================
    echo "💻 Iniciando en modo local..."
    echo ""
    
    # Verificar MongoDB
    print_info "Verificando MongoDB..."
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB no está corriendo"
        echo ""
        echo "Por favor inicia MongoDB manualmente:"
        echo "  - Windows: net start MongoDB"
        echo "  - Mac: brew services start mongodb-community"
        echo "  - Linux: sudo systemctl start mongod"
        echo ""
        read -p "Presiona Enter cuando MongoDB esté corriendo..."
    else
        print_success "MongoDB está corriendo"
    fi
    
    echo ""
    print_info "Iniciando servicios localmente..."
    echo ""
    
    # Crear script de inicio
    cat > start-local.sh <<'EOFSCRIPT'
#!/bin/bash

# Terminal 1: Backend
echo "🔧 Iniciando backend en puerto 3000..."
cd backend
npm run dev &
BACKEND_PID=$!

# Esperar a que backend esté listo
sleep 5

# Terminal 2: Frontend  
echo "📱 Iniciando frontend en puerto 5173..."
cd ..
npm run dev &
FRONTEND_PID=$!

# Manejar Ctrl+C
trap "echo 'Deteniendo servicios...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT

# Mantener script corriendo
wait
EOFSCRIPT
    
    chmod +x start-local.sh
    
    # Ejecutar
    ./start-local.sh
fi

echo ""
print_info "Presiona Ctrl+C para detener los servicios"
echo ""
