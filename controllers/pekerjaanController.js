// controllers/pekerjaanController.js
const pekerjaanService = require('../services/pekerjaanService');

// Mendapatkan semua pekerjaan dengan pagination
const getAllPekerjaan = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await pekerjaanService.getAllPekerjaan(page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan data pekerjaan',
      data: result
    });
  } catch (error) {
    console.error('Error mendapatkan pekerjaan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data pekerjaan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Mendapatkan detail pekerjaan berdasarkan ID
const getPekerjaanById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pekerjaan = await pekerjaanService.getPekerjaanById(id);
    
    if (!pekerjaan) {
      return res.status(404).json({
        success: false,
        message: 'Pekerjaan tidak ditemukan'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan detail pekerjaan',
      data: pekerjaan
    });
  } catch (error) {
    console.error('Error mendapatkan detail pekerjaan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail pekerjaan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Membuat pekerjaan baru
const createPekerjaan = async (req, res) => {
  try {
    const { namapekerjaan } = req.body;
    
    if (!namapekerjaan) {
      return res.status(400).json({
        success: false,
        message: 'Nama pekerjaan wajib diisi'
      });
    }
    
    const pekerjaan = await pekerjaanService.createPekerjaan({ namapekerjaan });
    
    res.status(201).json({
      success: true,
      message: 'Pekerjaan berhasil dibuat',
      data: pekerjaan
    });
  } catch (error) {
    console.error('Error membuat pekerjaan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat pekerjaan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Mengupdate pekerjaan
const updatePekerjaan = async (req, res) => {
  try {
    const { id } = req.params;
    const { namapekerjaan } = req.body;
    
    if (!namapekerjaan) {
      return res.status(400).json({
        success: false,
        message: 'Nama pekerjaan wajib diisi'
      });
    }
    
    // Cek apakah pekerjaan ada
    const existingPekerjaan = await pekerjaanService.getPekerjaanById(id);
    if (!existingPekerjaan) {
      return res.status(404).json({
        success: false,
        message: 'Pekerjaan tidak ditemukan'
      });
    }
    
    const updatedPekerjaan = await pekerjaanService.updatePekerjaan(id, { namapekerjaan });
    
    res.status(200).json({
      success: true,
      message: 'Pekerjaan berhasil diperbarui',
      data: updatedPekerjaan
    });
  } catch (error) {
    console.error('Error mengupdate pekerjaan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui pekerjaan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Menghapus pekerjaan
const deletePekerjaan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah pekerjaan ada
    const existingPekerjaan = await pekerjaanService.getPekerjaanById(id);
    if (!existingPekerjaan) {
      return res.status(404).json({
        success: false,
        message: 'Pekerjaan tidak ditemukan'
      });
    }
    
    await pekerjaanService.deletePekerjaan(id);
    
    res.status(200).json({
      success: true,
      message: 'Pekerjaan berhasil dihapus'
    });
  } catch (error) {
    console.error('Error menghapus pekerjaan:', error);
    
    // Cek jika error karena foreign key constraint (ada data yang masih terkait)
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Pekerjaan tidak dapat dihapus karena masih digunakan di data lain'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus pekerjaan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  getAllPekerjaan,
  getPekerjaanById,
  createPekerjaan,
  updatePekerjaan,
  deletePekerjaan
};