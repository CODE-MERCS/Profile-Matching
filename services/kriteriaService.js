// services/kriteriaService.js
const prisma = require('../configs/prisma');

class KriteriaService {
  // Mendapatkan semua data kriteria
  async getAllKriteria(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      
      const [kriterias, total] = await prisma.$transaction([
        prisma.kriteria.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.kriteria.count()
      ]);

      return {
        kriterias,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAllKriteria:', error);
      throw error;
    }
  }

  // Mendapatkan detail kriteria berdasarkan ID
  async getKriteriaById(id) {
    try {
      return await prisma.kriteria.findUnique({
        where: { id: id }
      });
    } catch (error) {
      console.error('Error in getKriteriaById:', error);
      throw error;
    }
  }

  // Membuat kriteria baru
  async createKriteria(data) {
    try {
      const { namakriteria, presentase } = data;
      
      // Pastikan presentase adalah tipe data yang benar (Decimal)
      const presentaseValue = typeof presentase === 'string' ? 
        parseFloat(presentase) : presentase;
        
      // Gunakan SQL raw query untuk menghindari masalah tipe data
      const result = await prisma.$queryRaw`
        INSERT INTO "kriteria" ("namakriteria", "presentase")
        VALUES (${namakriteria}, ${presentaseValue})
        RETURNING *;
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error in createKriteria:', error);
      throw error;
    }
  }

  // Mengupdate kriteria
  async updateKriteria(id, data) {
    try {
      const { namakriteria, presentase } = data;
      
      // Pastikan presentase adalah tipe data yang benar (Decimal)
      const presentaseValue = typeof presentase === 'string' ? 
        parseFloat(presentase) : presentase;
      
      // Gunakan SQL raw query untuk menghindari masalah tipe data
      const result = await prisma.$queryRaw`
        UPDATE "kriteria"
        SET "namakriteria" = ${namakriteria}, 
            "presentase" = ${presentaseValue},
            "updatedAt" = ${new Date()}
        WHERE "id" = ${id}
        RETURNING *;
      `;
      
      return result[0];
    } catch (error) {
      console.error('Error in updateKriteria:', error);
      throw error;
    }
  }

  // Menghapus kriteria
  async deleteKriteria(id) {
    try {
      // Periksa apakah kriteria ada subkriteria yang terkait
      const subkriteria = await prisma.subkriteria.findFirst({
        where: { id_kriteria: id }
      });
      
      if (subkriteria) {
        throw new Error('SUBKRITERIA_EXISTS');
      }
      
      return await prisma.kriteria.delete({
        where: { id: id }
      });
    } catch (error) {
      console.error('Error in deleteKriteria:', error);
      throw error;
    }
  }
}

module.exports = new KriteriaService();

module.exports = new KriteriaService();