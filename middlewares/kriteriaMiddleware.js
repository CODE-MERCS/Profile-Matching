// middlewares/kriteriaMiddleware.js
const { body, param, validationResult } = require('express-validator');

// Validasi input untuk membuat atau mengupdate kriteria
const validateKriteria = [
  body('namakriteria')
    .trim()
    .notEmpty()
    .withMessage('Nama kriteria wajib diisi')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama kriteria harus antara 3-100 karakter'),
  
  body('presentase')
    .notEmpty()
    .withMessage('Presentase wajib diisi')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Presentase harus berupa angka antara 0-100'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validasi parameter ID
const validateKriteriaId = [
  param('id')
    .notEmpty()
    .withMessage('ID kriteria diperlukan')
    .isUUID()
    .withMessage('Format ID kriteria tidak valid'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validasi ID gagal',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateKriteria,
  validateKriteriaId
};