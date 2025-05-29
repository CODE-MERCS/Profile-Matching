// services/pekerjaanService.js
const { PrismaClient } = require('@prisma/client');

// Buat instance Prisma yang baru untuk setiap request
// untuk menghindari konflik prepared statement
const getPrismaInstance = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] 
      : ['error'],
  });
};

class PekerjaanService {
  // Mendapatkan semua data pekerjaan
  async getAllPekerjaan(page = 1, limit = 10) {
    const prisma = getPrismaInstance();
    try {
      const skip = (page - 1) * limit;
      
      // Gunakan Prisma query builder daripada raw query
      const pekerjaans = await prisma.pekerjaan.findMany({
        skip,
        take: limit,
        orderBy: { 
          created_at: 'desc' 
        },
        select: {
          id_pekerjaan: true,
          namapekerjaan: true,
          created_at: true,
          updated_at: true
        }
      });
      
      // Map hasil untuk mengubah id_pekerjaan menjadi id untuk konsistensi
      const mappedPekerjaans = pekerjaans.map(p => ({
        id: p.id_pekerjaan,
        namapekerjaan: p.namapekerjaan,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      
      const total = await prisma.pekerjaan.count();

      return {
        pekerjaans: mappedPekerjaans,
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
    } finally {
      await prisma.$disconnect();
    }
  }

  // Mendapatkan detail pekerjaan berdasarkan ID
  async getPekerjaanById(id) {
    const prisma = getPrismaInstance();
    try {
      const idInt = parseInt(id);
      if (isNaN(idInt)) {
        throw new Error('ID pekerjaan harus berupa angka');
      }
      
      const pekerjaan = await prisma.pekerjaan.findUnique({
        where: { 
          id_pekerjaan: idInt 
        },
        select: {
          id_pekerjaan: true,
          namapekerjaan: true,
          created_at: true,
          updated_at: true
        }
      });
      
      if (!pekerjaan) return null;
      
      // Map hasil untuk mengubah id_pekerjaan menjadi id untuk konsistensi
      return {
        id: pekerjaan.id_pekerjaan,
        namapekerjaan: pekerjaan.namapekerjaan,
        created_at: pekerjaan.created_at,
        updated_at: pekerjaan.updated_at
      };
    } catch (error) {
      console.error('Error in getPekerjaanById:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Membuat pekerjaan baru
  async createPekerjaan(data) {
    const prisma = getPrismaInstance();
    try {
      const { namapekerjaan } = data;
      
      const pekerjaan = await prisma.pekerjaan.create({
        data: {
          namapekerjaan
        },
        select: {
          id_pekerjaan: true,
          namapekerjaan: true,
          created_at: true,
          updated_at: true
        }
      });
      
      // Map hasil untuk mengubah id_pekerjaan menjadi id untuk konsistensi
      return {
        id: pekerjaan.id_pekerjaan,
        namapekerjaan: pekerjaan.namapekerjaan,
        created_at: pekerjaan.created_at,
        updated_at: pekerjaan.updated_at
      };
    } catch (error) {
      console.error('Error in createPekerjaan:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Mengupdate pekerjaan
  async updatePekerjaan(id, data) {
    const prisma = getPrismaInstance();
    try {
      const idInt = parseInt(id);
      if (isNaN(idInt)) {
        throw new Error('ID pekerjaan harus berupa angka');
      }
      
      const { namapekerjaan } = data;
      
      const pekerjaan = await prisma.pekerjaan.update({
        where: { 
          id_pekerjaan: idInt 
        },
        data: {
          namapekerjaan,
          updated_at: new Date()
        },
        select: {
          id_pekerjaan: true,
          namapekerjaan: true,
          created_at: true,
          updated_at: true
        }
      });
      
      // Map hasil untuk mengubah id_pekerjaan menjadi id untuk konsistensi
      return {
        id: pekerjaan.id_pekerjaan,
        namapekerjaan: pekerjaan.namapekerjaan,
        created_at: pekerjaan.created_at,
        updated_at: pekerjaan.updated_at
      };
    } catch (error) {
      console.error('Error in updatePekerjaan:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  // Menghapus pekerjaan
  async deletePekerjaan(id) {
    const prisma = getPrismaInstance();
    try {
      const idInt = parseInt(id);
      if (isNaN(idInt)) {
        throw new Error('ID pekerjaan harus berupa angka');
      }
      
      const pekerjaan = await prisma.pekerjaan.delete({
        where: { 
          id_pekerjaan: idInt 
        },
        select: {
          id_pekerjaan: true,
          namapekerjaan: true
        }
      });
      
      // Map hasil untuk mengubah id_pekerjaan menjadi id untuk konsistensi
      return {
        id: pekerjaan.id_pekerjaan,
        namapekerjaan: pekerjaan.namapekerjaan
      };
    } catch (error) {
      console.error('Error in deletePekerjaan:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }
}

module.exports = new PekerjaanService();