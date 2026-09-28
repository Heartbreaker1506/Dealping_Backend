const { PrismaClient } = require("@prisma/client");

// Tránh tạo nhiều instance PrismaClient khi nodemon reload
const prisma = global.__dealpingPrisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  global.__dealpingPrisma = prisma;
}

module.exports = prisma;
