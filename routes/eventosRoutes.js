const express = require('express');
const multer = require('multer');
const router = express.Router();
const controller = require('../controllers/eventosController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.get('/', controller.obtenerEventos);
router.get('/estadisticas', controller.obtenerEstadisticas);
router.get('/:id', controller.obtenerEvento);
router.post('/', upload.single('evidencia'), controller.crearEvento);
router.put('/:id', controller.actualizarEvento);
router.delete('/:id', controller.eliminarEvento);

module.exports = router;
