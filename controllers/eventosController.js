const Evento = require('../models/Evento');
const { sequelize } = require('../config/database');

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
    const { fecha, tipo, lugar, persona_afectada, descripcion, estado, prioridad } = req.body;
    const evidencia = req.file ? req.file.filename : null;
    
    const nuevoEvento = await Evento.create({
      fecha: fecha || new Date(),
      tipo,
      lugar,
      persona_afectada,
      descripcion,
      evidencia,
      estado: estado || 'pendiente',
      prioridad: prioridad || 'media'
    });
    
    res.status(201).json({ 
      id: nuevoEvento.id,
      message: 'Evento creado exitosamente'
    });
  } catch (error) {
    console.error('Error al crear evento:', error);
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors.map(e => e.message) 
      });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
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
    const { fecha, tipo, lugar, persona_afectada, descripcion, estado, prioridad } = req.body;
    
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    await evento.update({
      fecha: fecha || evento.fecha,
      tipo: tipo || evento.tipo,
      lugar: lugar || evento.lugar,
      persona_afectada: persona_afectada || evento.persona_afectada,
      descripcion: descripcion || evento.descripcion,
      estado: estado || evento.estado,
      prioridad: prioridad || evento.prioridad
    });
    
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
    
    await evento.destroy();
    res.json({ message: 'Evento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

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
