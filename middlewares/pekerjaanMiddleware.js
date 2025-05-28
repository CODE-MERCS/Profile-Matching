// middlewares/pekerjaanMiddleware.js
const { body, param, validationResult } = require('express-validator');

// Validasi input untuk membuat atau mengupdate pekerjaan
const validatePekerjaan = [
  body('namapekerjaan')
    .trim()
    .notEmpty()
    .withMessage('Nama pekerjaan wajib diisi')
    .isLength({ min: 3, max: 100 })
    .withMessage('Nama pekerjaan harus antara 3-100 karakter'),
  
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
const validatePekerjaanId = [
  param('id')
    .notEmpty()
    .withMessage('ID pekerjaan diperlukan')
    .isUUID()
    .withMessage('Format ID pekerjaan tidak valid'),
  
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
  validatePekerjaan,
  validatePekerjaanId
};