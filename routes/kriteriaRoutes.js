// routes/kriteriaRoutes.js
const express = require('express');
const {
  getAllKriteria,
  getKriteriaById,
  createKriteria,
  updateKriteria,
  deleteKriteria
} = require('../controllers/kriteriaController');
const {
  validateKriteria,
  validateKriteriaId
} = require('../middlewares/kriteriaMiddleware');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Routes dengan auth middleware
// Semua route memerlukan login (verifyToken)
// Beberapa route hanya untuk admin (verifyAdmin)

// GET - Mendapatkan semua kriteria (dapat diakses oleh semua user yang login)
router.get('/', verifyToken, getAllKriteria);

// GET - Mendapatkan detail kriteria berdasarkan ID (dapat diakses oleh semua user yang login)
router.get('/:id', verifyToken, validateKriteriaId, getKriteriaById);

// POST - Membuat kriteria baru (hanya admin)
router.post('/', verifyToken, verifyAdmin, validateKriteria, createKriteria);

// PUT - Mengupdate kriteria (hanya admin)
router.put('/:id', verifyToken, verifyAdmin, validateKriteriaId, validateKriteria, updateKriteria);

// DELETE - Menghapus kriteria (hanya admin)
router.delete('/:id', verifyToken, verifyAdmin, validateKriteriaId, deleteKriteria);

module.exports = router;