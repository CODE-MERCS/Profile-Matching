// routes/pekerjaanRoutes.js
const express = require('express');
const {
  getAllPekerjaan,
  getPekerjaanById,
  createPekerjaan,
  updatePekerjaan,
  deletePekerjaan
} = require('../controllers/pekerjaanController');
const {
  validatePekerjaan,
  validatePekerjaanId
} = require('../middlewares/pekerjaanMiddleware');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes dengan auth middleware
// Semua route memerlukan login (verifyToken)
// Beberapa route hanya untuk admin (verifyAdmin)

// GET - Mendapatkan semua pekerjaan (dapat diakses oleh semua user yang login)
router.get('/', verifyToken, getAllPekerjaan);

// GET - Mendapatkan detail pekerjaan berdasarkan ID (dapat diakses oleh semua user yang login)
router.get('/:id', verifyToken, validatePekerjaanId, getPekerjaanById);

// POST - Membuat pekerjaan baru (hanya admin)
router.post('/', verifyToken, verifyAdmin, validatePekerjaan, createPekerjaan);

// PUT - Mengupdate pekerjaan (hanya admin)
router.put('/:id', verifyToken, verifyAdmin, validatePekerjaanId, validatePekerjaan, updatePekerjaan);

// DELETE - Menghapus pekerjaan (hanya admin)
router.delete('/:id', verifyToken, verifyAdmin, validatePekerjaanId, deletePekerjaan);

module.exports = router;