// services/pekerjaanService.js
const prisma = require('../configs/prisma');

class PekerjaanService {
  // Mendapatkan semua data pekerjaan
  async getAllPekerjaan(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      // Menggunakan prisma.$transaction untuk menjalankan kedua query dalam satu transaksi
      const [pekerjaans, total] = await prisma.$transaction([
        prisma.pekerjaan.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.pekerjaan.count()
      ]);

      return {
        pekerjaans,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllPekerjaan:', error);
      throw error;
    }
  }

  // Mendapatkan detail pekerjaan berdasarkan ID
  async getPekerjaanById(id) {
    try {
      return await prisma.pekerjaan.findUnique({
        where: { id: id }
      });
    } catch (error) {
      console.error('Error in getPekerjaanById:', error);
      throw error;
    }
  }

  // Membuat pekerjaan baru
  async createPekerjaan(data) {
    try {
      const { namapekerjaan } = data;
      
      return await prisma.pekerjaan.create({
        data: {
          namapekerjaan
        }
      });
    } catch (error) {
      console.error('Error in createPekerjaan:', error);
      throw error;
    }
  }

  // Mengupdate pekerjaan
  async updatePekerjaan(id, data) {
    try {
      const { namapekerjaan } = data;
      
      return await prisma.pekerjaan.update({
        where: { id: id },
        data: {
          namapekerjaan,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error in updatePekerjaan:', error);
      throw error;
    }
  }

  // Menghapus pekerjaan
  async deletePekerjaan(id) {
    try {
      return await prisma.pekerjaan.delete({
        where: { id: id }
      });
    } catch (error) {
      console.error('Error in deletePekerjaan:', error);
      throw error;
    }
  }
}

module.exports = new PekerjaanService();