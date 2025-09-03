#!/bin/bash

# Script para iniciar el servidor de registro de accidentes
# Uso: ./start-server.sh

echo "🚀 Iniciando servidor de registro de accidentes..."
echo "================================================"

# Verificar que estamos en el directorio correcto
if [ ! -f "index.js" ]; then
    echo "❌ Error: No se encontró index.js. Asegúrate de estar en el directorio backend."
    exit 1
fi

# Verificar que las dependencias estén instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
fi

# Verificar que MySQL esté ejecutándose
echo "🔍 Verificando conexión a MySQL..."
if ! /Applications/XAMPP/xamppfiles/bin/mysql -u root -S /Applications/XAMPP/xamppfiles/var/mysql/mysql.sock -e "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Error: MySQL no está ejecutándose o no se puede conectar."
    echo "💡 Solución: Inicia XAMPP o verifica la configuración."
    exit 1
fi

echo "✅ MySQL está funcionando correctamente."

# Iniciar el servidor
echo "🌐 Iniciando servidor en puerto 3001..."
echo "📊 API disponible en: http://localhost:3001/api"
echo "🔍 Health check: http://localhost:3001/api/health"
echo ""
echo "⏹️  Para detener el servidor, presiona Ctrl+C"
echo "================================================"

# Iniciar el servidor
node index.js
