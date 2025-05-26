const { PrismaClient } = require('@prisma/client'); // Import dari package yang benar
const prisma = new PrismaClient();

module.exports = prisma;