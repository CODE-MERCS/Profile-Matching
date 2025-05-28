// controllers/kriteriaController.js
const kriteriaService = require('../services/kriteriaService');

// Mendapatkan semua kriteria dengan pagination
const getAllKriteria = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await kriteriaService.getAllKriteria(page, limit);
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan data kriteria',
      data: result
    });
  } catch (error) {
    console.error('Error mendapatkan kriteria:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data kriteria',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Mendapatkan detail kriteria berdasarkan ID
const getKriteriaById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const kriteria = await kriteriaService.getKriteriaById(id);
    
    if (!kriteria) {
      return res.status(404).json({
        success: false,
        message: 'Kriteria tidak ditemukan'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Berhasil mendapatkan detail kriteria',
      data: kriteria
    });
  } catch (error) {
    console.error('Error mendapatkan detail kriteria:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail kriteria',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Membuat kriteria baru
const createKriteria = async (req, res) => {
  try {
    const { namakriteria, presentase } = req.body;
    
    if (!namakriteria || !presentase) {
      return res.status(400).json({
        success: false,
        message: 'Nama kriteria dan presentase wajib diisi'
      });
    }
    
    // Validasi format presentase
    const presentaseValue = parseFloat(presentase);
    if (isNaN(presentaseValue) || presentaseValue < 0 || presentaseValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Presentase harus berupa angka antara 0-100'
      });
    }
    
    const kriteria = await kriteriaService.createKriteria({ 
      namakriteria, 
      presentase: presentaseValue 
    });
    
    res.status(201).json({
      success: true,
      message: 'Kriteria berhasil dibuat',
      data: kriteria
    });
  } catch (error) {
    console.error('Error membuat kriteria:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat kriteria',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Mengupdate kriteria
const updateKriteria = async (req, res) => {
  try {
    const { id } = req.params;
    const { namakriteria, presentase } = req.body;
    
    if (!namakriteria || !presentase) {
      return res.status(400).json({
        success: false,
        message: 'Nama kriteria dan presentase wajib diisi'
      });
    }
    
    // Validasi format presentase
    const presentaseValue = parseFloat(presentase);
    if (isNaN(presentaseValue) || presentaseValue < 0 || presentaseValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Presentase harus berupa angka antara 0-100'
      });
    }
    
    // Cek apakah kriteria ada
    const existingKriteria = await kriteriaService.getKriteriaById(id);
    if (!existingKriteria) {
      return res.status(404).json({
        success: false,
        message: 'Kriteria tidak ditemukan'
      });
    }
    
    const updatedKriteria = await kriteriaService.updateKriteria(id, { 
      namakriteria, 
      presentase: presentaseValue 
    });
    
    res.status(200).json({
      success: true,
      message: 'Kriteria berhasil diperbarui',
      data: updatedKriteria
    });
  } catch (error) {
    console.error('Error mengupdate kriteria:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui kriteria',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

// Menghapus kriteria
const deleteKriteria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Cek apakah kriteria ada
    const existingKriteria = await kriteriaService.getKriteriaById(id);
    if (!existingKriteria) {
      return res.status(404).json({
        success: false,
        message: 'Kriteria tidak ditemukan'
      });
    }
    
    await kriteriaService.deleteKriteria(id);
    
    res.status(200).json({
      success: true,
      message: 'Kriteria berhasil dihapus'
    });
  } catch (error) {
    console.error('Error menghapus kriteria:', error);
    
    // Cek jika error karena subkriteria terkait
    if (error.message === 'SUBKRITERIA_EXISTS') {
      return res.status(400).json({
        success: false,
        message: 'Kriteria tidak dapat dihapus karena masih memiliki subkriteria terkait'
      });
    }
    
    // Cek jika error karena foreign key constraint (ada data yang masih terkait)
    if (error.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Kriteria tidak dapat dihapus karena masih digunakan di data lain'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus kriteria',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

module.exports = {
  getAllKriteria,
  getKriteriaById,
  createKriteria,
  updateKriteria,
  deleteKriteria
};

module.exports = {
  getAllKriteria,
  getKriteriaById,
  createKriteria,
  updateKriteria,
  deleteKriteria
};