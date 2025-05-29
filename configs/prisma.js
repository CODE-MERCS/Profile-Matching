// configs/prisma.js
const { PrismaClient } = require('@prisma/client');

// Menggunakan singleton pattern untuk memastikan hanya ada satu instance PrismaClient
// di seluruh aplikasi, yang dapat mencegah terlalu banyak koneksi database

// Konfigurasi logging untuk Prisma
const logLevels = process.env.NODE_ENV === 'development' 
  ? ['query', 'info', 'warn', 'error'] 
  : ['error'];

// Periksa apakah kita sudah memiliki koneksi prisma di global object
const prisma = global.prisma || new PrismaClient({
  log: logLevels,
});

// Simpan prisma di global object di lingkungan development untuk mencegah hot-reloading
// membuat banyak koneksi
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

module.exports = prisma;