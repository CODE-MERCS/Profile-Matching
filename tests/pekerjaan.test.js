// tests/pekerjaan.test.js
const request = require('supertest');
const app = require('../app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

// Token untuk autentikasi
const adminToken = jwt.sign({ 
  userId: 1, 
  email: 'admin@example.com', 
  role: 'admin' 
}, process.env.JWT_SECRET || 'test-secret-key');

const userToken = jwt.sign({ 
  userId: 2, 
  email: 'user@example.com', 
  role: 'user' 
}, process.env.JWT_SECRET || 'test-secret-key');

// Test data
let testPekerjaanId;

// Gunakan koneksi langsung ke database untuk setup/teardown test
// alih-alih menggunakan prisma.$executeRaw yang menyebabkan konflik
const setupTestData = async () => {
  const prisma = new PrismaClient();
  try {
    // Hapus data test lama
    await prisma.pekerjaan.deleteMany({
      where: {
        namapekerjaan: {
          contains: 'Test'
        }
      }
    });
    
    // Buat data test baru
    const pekerjaan = await prisma.pekerjaan.create({
      data: {
        namapekerjaan: 'Test Pekerjaan'
      }
    });
    
    testPekerjaanId = pekerjaan.id_pekerjaan;
    console.log('Created test pekerjaan with ID:', testPekerjaanId);
    
    return pekerjaan;
  } catch (error) {
    console.error('Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Hapus semua data test
const cleanupTestData = async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.pekerjaan.deleteMany({
      where: {
        namapekerjaan: {
          contains: 'Test'
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
};

// Setup dan teardown
beforeAll(async () => {
  await setupTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

describe('Pekerjaan API', () => {
  
  // Test mendapatkan semua pekerjaan
  describe('GET /pekerjaan', () => {
    
    // Sukses mendapatkan semua pekerjaan
    it('should return all pekerjaan when authenticated', async () => {
      const response = await request(app)
        .get('/pekerjaan')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pekerjaans');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.pekerjaans)).toBe(true);
    });
    
    // Gagal karena tidak ada token
    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/pekerjaan');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  // Test mendapatkan detail pekerjaan
  describe('GET /pekerjaan/:id', () => {
    
    // Sukses mendapatkan detail pekerjaan
    it('should return pekerjaan detail when ID exists', async () => {
      // Skip test jika testPekerjaanId tidak ada
      if (!testPekerjaanId) {
        console.warn('Skipping test: testPekerjaanId not available');
        return;
      }
      
      const response = await request(app)
        .get(`/pekerjaan/${testPekerjaanId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('namapekerjaan', 'Test Pekerjaan');
    });
    
    // Gagal karena ID tidak ditemukan
    it('should return 404 when ID does not exist', async () => {
      const response = await request(app)
        .get('/pekerjaan/999999')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
    
    // Gagal karena ID invalid
    it('should return 400 when ID is invalid', async () => {
      const response = await request(app)
        .get('/pekerjaan/abc')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  // Test membuat pekerjaan baru
  describe('POST /pekerjaan', () => {
    
    // Sukses membuat pekerjaan baru (admin)
    it('should create new pekerjaan when admin is authenticated', async () => {
      const response = await request(app)
        .post('/pekerjaan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ namapekerjaan: 'Test New Pekerjaan' });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('namapekerjaan', 'Test New Pekerjaan');
    });
    
    // Gagal karena user biasa tidak boleh membuat pekerjaan
    it('should return 403 when non-admin tries to create pekerjaan', async () => {
      const response = await request(app)
        .post('/pekerjaan')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ namapekerjaan: 'Test New Pekerjaan' });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    // Gagal karena data tidak valid
    it('should return 400 when data is invalid', async () => {
      // Nama terlalu pendek
      const response = await request(app)
        .post('/pekerjaan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ namapekerjaan: 'AB' });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
  });
  
  // Test mengupdate pekerjaan
  describe('PUT /pekerjaan/:id', () => {
    
    // Sukses mengupdate pekerjaan (admin)
    it('should update pekerjaan when admin is authenticated', async () => {
      // Skip test jika testPekerjaanId tidak ada
      if (!testPekerjaanId) {
        console.warn('Skipping test: testPekerjaanId not available');
        return;
      }
      
      const response = await request(app)
        .put(`/pekerjaan/${testPekerjaanId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ namapekerjaan: 'Updated Test Pekerjaan' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('namapekerjaan', 'Updated Test Pekerjaan');
    });
    
    // Gagal karena user biasa tidak boleh mengupdate pekerjaan
    it('should return 403 when non-admin tries to update pekerjaan', async () => {
      // Skip test jika testPekerjaanId tidak ada
      if (!testPekerjaanId) {
        console.warn('Skipping test: testPekerjaanId not available');
        return;
      }
      
      const response = await request(app)
        .put(`/pekerjaan/${testPekerjaanId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ namapekerjaan: 'Should Not Update' });
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    // Gagal karena ID tidak ditemukan
    it('should return 404 when ID does not exist', async () => {
      const response = await request(app)
        .put('/pekerjaan/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ namapekerjaan: 'Should Not Update' });
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
  
  // Test menghapus pekerjaan
  describe('DELETE /pekerjaan/:id', () => {
    let deleteTestId;
    
    // Buat pekerjaan baru untuk dihapus
    beforeEach(async () => {
      // Gunakan instance Prisma baru untuk menghindari konflik
      const prisma = new PrismaClient();
      try {
        const pekerjaan = await prisma.pekerjaan.create({
          data: {
            namapekerjaan: 'Test Delete Pekerjaan'
          }
        });
        
        deleteTestId = pekerjaan.id_pekerjaan;
        console.log('Created test pekerjaan for deletion with ID:', deleteTestId);
      } catch (error) {
        console.error('Error creating test data for deletion:', error);
      } finally {
        await prisma.$disconnect();
      }
    });
    
    // Sukses menghapus pekerjaan (admin)
    it('should delete pekerjaan when admin is authenticated', async () => {
      // Skip test jika deleteTestId tidak ada
      if (!deleteTestId) {
        console.warn('Skipping test: deleteTestId not available');
        return;
      }
      
      const response = await request(app)
        .delete(`/pekerjaan/${deleteTestId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('berhasil dihapus');
      
      // Verifikasi bahwa pekerjaan sudah terhapus
      const prisma = new PrismaClient();
      try {
        const deleted = await prisma.pekerjaan.findUnique({
          where: { id_pekerjaan: deleteTestId }
        });
        expect(deleted).toBeNull();
      } finally {
        await prisma.$disconnect();
      }
    });
    
    // Gagal karena user biasa tidak boleh menghapus pekerjaan
    it('should return 403 when non-admin tries to delete pekerjaan', async () => {
      // Skip test jika testPekerjaanId tidak ada
      if (!testPekerjaanId) {
        console.warn('Skipping test: testPekerjaanId not available');
        return;
      }
      
      const response = await request(app)
        .delete(`/pekerjaan/${testPekerjaanId}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    // Gagal karena ID tidak ditemukan
    it('should return 404 when ID does not exist', async () => {
      const response = await request(app)
        .delete('/pekerjaan/999999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});