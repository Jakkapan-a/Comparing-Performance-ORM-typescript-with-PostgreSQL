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


export const getMemoryUsageMB = () => {
  const mem = process.memoryUsage();
  return (mem.rss / 1024 / 1024).toFixed(2); // Resident Set Size (MB)
};

export const getCPUUsage = () => {
  const usage = process.cpuUsage();
  return `${(usage.user / 1000).toFixed(2)}ms user / ${(usage.system / 1000).toFixed(2)}ms system`;
};