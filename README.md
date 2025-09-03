# Backend - Sistema de Registro de Accidentes

## Configuración de la Base de Datos MySQL

### Requisitos Previos
- MySQL Server 8.0 o superior
- Node.js 16 o superior
- npm o yarn

### 1. Instalar MySQL

#### En macOS (usando Homebrew):
```bash
brew install mysql
brew services start mysql
```

#### En Windows:
- Descargar MySQL Installer desde [mysql.com](https://dev.mysql.com/downloads/installer/)
- Instalar MySQL Server

#### En Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 2. Configurar MySQL

#### Acceder a MySQL:
```bash
mysql -u root -p
```

#### Crear la base de datos:
```sql
CREATE DATABASE registro_accidentes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Crear usuario (opcional pero recomendado):
```sql
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON registro_accidentes.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configurar Variables de Entorno

Edita el archivo `config.env` con tus credenciales:

```env
# Configuración de la base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root          # o 'app_user' si creaste un usuario
DB_PASSWORD=          # tu contraseña de MySQL
DB_NAME=registro_accidentes
DB_DIALECT=mysql

# Configuración del servidor
PORT=3001
NODE_ENV=development
```

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar el Servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

### 6. Verificar la Conexión

El servidor mostrará mensajes de estado:
- ✅ Conexión a MySQL establecida correctamente
- ✅ Base de datos sincronizada correctamente
- 🚀 Servidor backend iniciado en puerto 3001

### 7. Endpoints de la API

- `GET /api/health` - Estado del servidor
- `GET /api/eventos` - Obtener todos los eventos
- `GET /api/eventos/estadisticas` - Obtener estadísticas
- `GET /api/eventos/:id` - Obtener evento específico
- `POST /api/eventos` - Crear nuevo evento
- `PUT /api/eventos/:id` - Actualizar evento
- `DELETE /api/eventos/:id` - Eliminar evento

### 8. Conectar con DBeaver

1. Abrir DBeaver
2. Crear nueva conexión
3. Seleccionar MySQL
4. Configurar:
   - Host: localhost
   - Port: 3306
   - Database: registro_accidentes
   - Username: root (o tu usuario)
   - Password: tu contraseña
5. Testar conexión
6. Conectar

### 9. Estructura de la Base de Datos

La tabla `eventos` se creará automáticamente con los siguientes campos:

- `id` - Identificador único (auto-incremento)
- `fecha` - Fecha del evento
- `tipo` - Tipo de evento (accidente, incidente, casi_accidente)
- `lugar` - Lugar donde ocurrió
- `persona_afectada` - Nombre de la persona afectada
- `descripcion` - Descripción detallada
- `evidencia` - Nombre del archivo de evidencia
- `estado` - Estado del evento (pendiente, en_revision, resuelto, cerrado)
- `prioridad` - Prioridad (baja, media, alta, critica)
- `fecha_creacion` - Fecha de creación del registro
- `fecha_actualizacion` - Fecha de última actualización

### 10. Solución de Problemas

#### Error de conexión:
- Verificar que MySQL esté ejecutándose
- Verificar credenciales en `config.env`
- Verificar que el puerto 3306 esté disponible

#### Error de permisos:
- Verificar que el usuario tenga permisos en la base de datos
- Verificar que la base de datos exista

#### Error de Sequelize:
- Verificar que todas las dependencias estén instaladas
- Verificar la configuración de la base de datos

### 11. Comandos Útiles

```bash
# Ver estado de MySQL (macOS)
brew services list | grep mysql

# Reiniciar MySQL (macOS)
brew services restart mysql

# Ver logs de MySQL
tail -f /usr/local/var/mysql/*.err

# Acceder a MySQL
mysql -u root -p

# Ver bases de datos
SHOW DATABASES;

# Usar base de datos
USE registro_accidentes;

# Ver tablas
SHOW TABLES;
```
