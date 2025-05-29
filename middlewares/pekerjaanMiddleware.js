// middlewares/pekerjaanMiddleware.js
const validator = require('express-validator');

// Validasi input untuk membuat atau mengupdate pekerjaan
const validatePekerjaan = [
  validator.body('namapekerjaan')
    .trim()
    .notEmpty()
    .withMessage('Nama pekerjaan wajib diisi')
    .isLength({ min: 3, max: 50 })
    .withMessage('Nama pekerjaan harus antara 3-50 karakter'),
  
  (req, res, next) => {
    const errors = validator.validationResult(req);
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
  validator.param('id')
    .notEmpty()
    .withMessage('ID pekerjaan diperlukan')
    .isInt()
    .withMessage('ID pekerjaan harus berupa angka'),
  
  (req, res, next) => {
    const errors = validator.validationResult(req);
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