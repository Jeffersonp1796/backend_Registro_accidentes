const Evento = require('../models/Evento');
const { sequelize } = require('../config/database');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configuración de Cloudinary (con fallback)
let cloudinaryConfigured = false;
let storage;
let upload;

try {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Configuración de almacenamiento con Cloudinary
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'eventos',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      }
    });

    upload = multer({ storage: storage });
    cloudinaryConfigured = true;
    console.log('✅ Cloudinary configurado correctamente');
  } else {
    throw new Error('Variables de entorno de Cloudinary no configuradas');
  }
} catch (error) {
  console.warn('⚠️  Cloudinary no configurado, usando almacenamiento local como fallback');
  console.warn('   Para usar Cloudinary, configure las variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  
  // Fallback a almacenamiento local
  const localStorage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
  });
  
  upload = multer({ storage: localStorage });
  cloudinaryConfigured = false;
}

exports.obtenerEventos = async (req, res) => {
  try {
    const eventos = await Evento.findAll({
      order: [['fecha', 'DESC']]
    });
    res.json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.crearEvento = async (req, res) => {
  try {
    const { fecha, tipo, lugar, persona_afectada, descripcion, estado, prioridad, imagenes_adicionales } = req.body;
    
    // Procesar imagen principal si existe
    let imagenPrincipalData = null;
    if (req.file) {
      if (cloudinaryConfigured) {
        // Cloudinary: req.file.path contiene la URL completa
        imagenPrincipalData = {
          url: req.file.path,
          public_id: req.file.filename
        };
      } else {
        // Almacenamiento local: req.file.filename contiene el nombre del archivo
        imagenPrincipalData = {
          url: `http://localhost:${process.env.PORT || 3001}/uploads/${req.file.filename}`,
          public_id: req.file.filename
        };
      }
    }
    
    // Procesar imágenes adicionales si vienen en el body
    let imagenesAdicionalesArray = [];
    if (imagenes_adicionales) {
      try {
        imagenesAdicionalesArray = JSON.parse(imagenes_adicionales);
      } catch (e) {
        console.error('Error al parsear imágenes adicionales:', e);
      }
    }
    
    const nuevoEvento = await Evento.create({
      fecha: fecha || new Date(),
      tipo,
      lugar,
      persona_afectada,
      descripcion,
      evidencia: req.file ? (cloudinaryConfigured ? req.file.path : req.file.filename) : null, // Mantener compatibilidad
      imagen_principal_url: imagenPrincipalData?.url || null,
      imagen_principal_public_id: imagenPrincipalData?.public_id || null,
      imagenes_adicionales: imagenesAdicionalesArray,
      estado: estado || 'pendiente',
      prioridad: prioridad || 'media'
    });
    
    res.status(201).json({ 
      id: nuevoEvento.id,
      message: 'Evento creado exitosamente',
      evento: nuevoEvento
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};

exports.obtenerEvento = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    res.json(evento);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.actualizarEvento = async (req, res) => {
  try {
    const { fecha, tipo, lugar, persona_afectada, descripcion, estado, prioridad, imagenes_adicionales } = req.body;
    
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Si hay una nueva imagen principal, eliminar la anterior (solo si Cloudinary está configurado)
    if (req.file && evento.imagen_principal_public_id && cloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(evento.imagen_principal_public_id);
      } catch (error) {
        console.error('Error al eliminar imagen anterior:', error);
      }
    }
    
    // Procesar nueva imagen principal si existe
    let imagenPrincipalData = null;
    if (req.file) {
      if (cloudinaryConfigured) {
        // Cloudinary: req.file.path contiene la URL completa
        imagenPrincipalData = {
          url: req.file.path,
          public_id: req.file.filename
        };
      } else {
        // Almacenamiento local: req.file.filename contiene el nombre del archivo
        imagenPrincipalData = {
          url: `http://localhost:${process.env.PORT || 3001}/uploads/${req.file.filename}`,
          public_id: req.file.filename
        };
      }
    }
    
    // Procesar imágenes adicionales si vienen en el body
    let imagenesAdicionalesArray = evento.imagenes_adicionales || [];
    if (imagenes_adicionales) {
      try {
        imagenesAdicionalesArray = JSON.parse(imagenes_adicionales);
      } catch (e) {
        console.error('Error al parsear imágenes adicionales:', e);
      }
    }
    
    const updateData = {
      fecha: fecha || evento.fecha,
      tipo: tipo || evento.tipo,
      lugar: lugar || evento.lugar,
      persona_afectada: persona_afectada || evento.persona_afectada,
      descripcion: descripcion || evento.descripcion,
      estado: estado || evento.estado,
      prioridad: prioridad || evento.prioridad,
      imagenes_adicionales: imagenesAdicionalesArray
    };
    
    // Solo actualizar campos de imagen si hay una nueva imagen
    if (imagenPrincipalData) {
      updateData.imagen_principal_url = imagenPrincipalData.url;
      updateData.imagen_principal_public_id = imagenPrincipalData.public_id;
      updateData.evidencia = cloudinaryConfigured ? req.file.path : req.file.filename; // Mantener compatibilidad
    }
    
    await evento.update(updateData);
    
    res.json({ 
      message: 'Evento actualizado exitosamente',
      evento: evento
    });
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.eliminarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Eliminar imagen principal de Cloudinary si existe (solo si Cloudinary está configurado)
    if (evento.imagen_principal_public_id && cloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(evento.imagen_principal_public_id);
      } catch (error) {
        console.error('Error al eliminar imagen principal:', error);
      }
    }
    
    // Eliminar imágenes adicionales de Cloudinary si existen (solo si Cloudinary está configurado)
    let imagenesAdicionales = [];
    if (evento.imagenes_adicionales) {
      if (typeof evento.imagenes_adicionales === 'string') {
        try {
          imagenesAdicionales = JSON.parse(evento.imagenes_adicionales);
        } catch (e) {
          console.error('Error al parsear imágenes adicionales:', e);
          imagenesAdicionales = [];
        }
      } else if (Array.isArray(evento.imagenes_adicionales)) {
        imagenesAdicionales = evento.imagenes_adicionales;
      }
    }
    
    if (imagenesAdicionales.length > 0 && cloudinaryConfigured) {
      for (const imagen of imagenesAdicionales) {
        if (imagen.public_id) {
          try {
            await cloudinary.uploader.destroy(imagen.public_id);
          } catch (error) {
            console.error('Error al eliminar imagen adicional:', error);
          }
        }
      }
    }
    
    await evento.destroy();
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Método para subir imagen adicional a un evento existente
exports.subirImagenAdicional = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
    }
    
    const nuevaImagen = {
      url: cloudinaryConfigured ? req.file.path : `http://localhost:${process.env.PORT || 3001}/uploads/${req.file.filename}`,
      public_id: req.file.filename
    };
    
    // Agregar la nueva imagen al array de imágenes adicionales
    let imagenesActuales = [];
    if (evento.imagenes_adicionales) {
      if (typeof evento.imagenes_adicionales === 'string') {
        try {
          imagenesActuales = JSON.parse(evento.imagenes_adicionales);
        } catch (e) {
          console.error('Error al parsear imágenes adicionales:', e);
          imagenesActuales = [];
        }
      } else if (Array.isArray(evento.imagenes_adicionales)) {
        imagenesActuales = evento.imagenes_adicionales;
      }
    }
    imagenesActuales.push(nuevaImagen);
    
    await evento.update({
      imagenes_adicionales: imagenesActuales
    });
    
    res.json({
      message: 'Imagen adicional subida exitosamente',
      imagen: nuevaImagen,
      totalImagenes: imagenesActuales.length
    });
  } catch (error) {
    console.error('Error al subir imagen adicional:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Método para eliminar una imagen específica de un evento
exports.eliminarImagen = async (req, res) => {
  try {
    const { eventoId, publicId } = req.params;
    
    const evento = await Evento.findByPk(eventoId);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Eliminar de Cloudinary (solo si Cloudinary está configurado)
    if (cloudinaryConfigured) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error al eliminar imagen de Cloudinary:', error);
      }
    }
    
    // Eliminar del array de imágenes adicionales
    let imagenesActuales = [];
    if (evento.imagenes_adicionales) {
      if (typeof evento.imagenes_adicionales === 'string') {
        try {
          imagenesActuales = JSON.parse(evento.imagenes_adicionales);
        } catch (e) {
          console.error('Error al parsear imágenes adicionales:', e);
          imagenesActuales = [];
        }
      } else if (Array.isArray(evento.imagenes_adicionales)) {
        imagenesActuales = evento.imagenes_adicionales;
      }
    }
    
    const imagenesFiltradas = imagenesActuales.filter(
      img => img.public_id !== publicId
    );
    
    await evento.update({
      imagenes_adicionales: imagenesFiltradas
    });
    
    res.json({
      message: 'Imagen eliminada exitosamente',
      imagenesRestantes: imagenesFiltradas.length
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Método para obtener URLs optimizadas de imágenes
exports.obtenerImagenesOptimizadas = async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    const imagenesOptimizadas = {
      principal: null,
      adicionales: []
    };
    
    // Generar URL optimizada para imagen principal (solo si Cloudinary está configurado)
    if (evento.imagen_principal_public_id) {
      if (cloudinaryConfigured) {
        imagenesOptimizadas.principal = cloudinary.url(evento.imagen_principal_public_id, {
          width: 800,
          height: 600,
          crop: 'fill',
          quality: 'auto',
          format: 'auto'
        });
      } else {
        imagenesOptimizadas.principal = evento.imagen_principal_url;
      }
    }
    
    // Generar URLs optimizadas para imágenes adicionales (solo si Cloudinary está configurado)
    let imagenesAdicionales = [];
    if (evento.imagenes_adicionales) {
      if (typeof evento.imagenes_adicionales === 'string') {
        try {
          imagenesAdicionales = JSON.parse(evento.imagenes_adicionales);
        } catch (e) {
          console.error('Error al parsear imágenes adicionales:', e);
          imagenesAdicionales = [];
        }
      } else if (Array.isArray(evento.imagenes_adicionales)) {
        imagenesAdicionales = evento.imagenes_adicionales;
      }
    }
    
    if (imagenesAdicionales.length > 0) {
      imagenesOptimizadas.adicionales = imagenesAdicionales.map(imagen => ({
        url: cloudinaryConfigured ? 
          cloudinary.url(imagen.public_id, {
            width: 400,
            height: 300,
            crop: 'fill',
            quality: 'auto',
            format: 'auto'
          }) : 
          imagen.url,
        public_id: imagen.public_id
      }));
    }
    
    res.json(imagenesOptimizadas);
  } catch (error) {
    console.error('Error al obtener imágenes optimizadas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Exportar configuración de multer para usar en las rutas
exports.upload = upload;

// Nuevo método para obtener estadísticas
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const totalEventos = await Evento.count();
    const eventosPorTipo = await Evento.findAll({
      attributes: [
        'tipo',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['tipo']
    });
    
    const eventosPorEstado = await Evento.findAll({
      attributes: [
        'estado',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['estado']
    });
    
    const eventosPorPrioridad = await Evento.findAll({
      attributes: [
        'prioridad',
        [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad']
      ],
      group: ['prioridad']
    });
    
    res.json({
      total: totalEventos,
      porTipo: eventosPorTipo,
      porEstado: eventosPorEstado,
      porPrioridad: eventosPorPrioridad
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
