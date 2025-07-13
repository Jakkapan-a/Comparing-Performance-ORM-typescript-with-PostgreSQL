// tests/prisma/config.ts
import { Prisma, PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
});
let queryCount = 0;

prisma.$on('query',  (e) => {
  // console.log(`Query: ${e.query} , Params: ${e.params} , Duration: ${e.duration}ms`);
  queryCount++;
});
export const setupQueryCounter = () => {
  queryCount = 0;
  return () => queryCount;
};

// export const setupQueryCounter = () => {
//   let queryCount = 0;
//   prisma.$on('query', (e) => {
//     console.log(`Query: ${e.query} , Params: ${e.params} , Duration: ${e.duration}ms`);
//     queryCount++;
//   });
//   return () => queryCount;
// };



