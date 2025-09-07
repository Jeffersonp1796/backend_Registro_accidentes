const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Evento = sequelize.define('Evento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  tipo: {
    type: DataTypes.ENUM('accidente', 'incidente', 'casi_accidente'),
    allowNull: false
  },
  lugar: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  persona_afectada: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  evidencia: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  // Cloudinary image fields
  imagen_principal_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL de la imagen principal en Cloudinary'
  },
  imagen_principal_public_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Public ID de la imagen principal en Cloudinary'
  },
  imagenes_adicionales: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array de objetos con URLs y public_ids de imágenes adicionales',
    defaultValue: []
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'en_revision', 'resuelto', 'cerrado'),
    defaultValue: 'pendiente'
  },
  prioridad: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'critica'),
    defaultValue: 'media'
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'eventos',
  timestamps: true,
  createdAt: 'fecha_creacion',
  updatedAt: 'fecha_actualizacion',
  indexes: [
    {
      fields: ['fecha']
    },
    {
      fields: ['tipo']
    },
    {
      fields: ['estado']
    },
    {
      fields: ['prioridad']
    }
  ]
});

module.exports = Evento;
