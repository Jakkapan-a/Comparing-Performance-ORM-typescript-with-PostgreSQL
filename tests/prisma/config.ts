// tests/prisma/config.ts
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});

export const setupQueryCounter = () => {
  let queryCount = 0;
  prisma.$on('query', () => {
    queryCount++;
  });
  return () => queryCount;
};



