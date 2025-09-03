# 🚂 Railway Deployment Guide

## Configuración para Railway

Este proyecto ha sido configurado para ser desplegado en Railway. Sigue estos pasos para el despliegue:

### 1. Preparación del Proyecto

El proyecto ya incluye los archivos necesarios para Railway:
- `railway.json` - Configuración de Railway
- `Procfile` - Proceso web para Railway
- `env.example` - Variables de entorno de ejemplo

### 2. Configuración de la Base de Datos

#### Opción A: MySQL de Railway
1. Crea un nuevo servicio MySQL en Railway
2. Copia las credenciales de conexión
3. Configura las variables de entorno en Railway

#### Opción B: Base de Datos Externa
Si usas una base de datos externa (como PlanetScale, AWS RDS, etc.), asegúrate de que sea accesible desde Railway.

### 3. Variables de Entorno en Railway

Configura estas variables en tu proyecto de Railway:

```bash
# Base de Datos
DB_HOST=tu-host-mysql
DB_PORT=3306
DB_USER=tu-usuario-mysql
DB_PASSWORD=tu-password-mysql
DB_NAME=tu-nombre-database
DB_DIALECT=mysql

# Servidor
PORT=3001
NODE_ENV=production
```

### 4. Despliegue

1. Conecta tu repositorio de GitHub a Railway
2. Railway detectará automáticamente la configuración
3. El build se ejecutará automáticamente
4. La aplicación se desplegará en la URL proporcionada por Railway

### 5. Verificación del Despliegue

Una vez desplegado, verifica:
- Health check: `https://tu-app.railway.app/api/health`
- API de eventos: `https://tu-app.railway.app/api/eventos`

### 6. Configuración de Dominio Personalizado (Opcional)

Railway permite configurar dominios personalizados en la configuración del proyecto.

### 7. Monitoreo y Logs

- Los logs están disponibles en el dashboard de Railway
- Configura alertas para errores de la aplicación
- Monitorea el uso de recursos

### 8. Escalado

Railway permite escalar automáticamente tu aplicación según la demanda.

## Notas Importantes

- **SSL**: La configuración incluye SSL para producción
- **Pool de Conexiones**: Optimizado para entornos de producción
- **Logging**: Deshabilitado en producción para mejor rendimiento
- **Variables de Entorno**: Asegúrate de configurar todas las variables necesarias

## Solución de Problemas

### Error de Conexión a la Base de Datos
- Verifica que las credenciales sean correctas
- Asegúrate de que la base de datos sea accesible desde Railway
- Verifica que el puerto esté abierto

### Error de Build
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el script `start` esté correctamente configurado

### Error de Variables de Entorno
- Verifica que todas las variables estén configuradas en Railway
- Asegúrate de que no haya espacios extra en los valores

## Soporte

Para más información sobre Railway, consulta:
- [Documentación oficial de Railway](https://docs.railway.app/)
- [Guía de despliegue de Node.js](https://docs.railway.app/deploy/deployments)
