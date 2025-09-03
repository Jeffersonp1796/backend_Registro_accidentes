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
