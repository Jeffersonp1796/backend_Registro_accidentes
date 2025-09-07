const express = require('express');
const router = express.Router();
const controller = require('../controllers/eventosController');

// Usar el middleware de Cloudinary del controlador
const upload = controller.upload;

router.get('/', controller.obtenerEventos);
router.get('/estadisticas', controller.obtenerEstadisticas);
router.get('/:id', controller.obtenerEvento);
router.get('/:id/imagenes-optimizadas', controller.obtenerImagenesOptimizadas);
router.post('/', upload.single('evidencia'), controller.crearEvento);
router.put('/:id', upload.single('evidencia'), controller.actualizarEvento);
router.post('/:id/imagenes', upload.single('imagen'), controller.subirImagenAdicional);
router.delete('/:eventoId/imagenes/:publicId', controller.eliminarImagen);
router.delete('/:id', controller.eliminarEvento);

module.exports = router;
