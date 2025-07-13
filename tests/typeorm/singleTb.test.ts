import { faker } from "@faker-js/faker";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { getMemoryUsageMB } from "../utils/memory";
import { In } from "typeorm";

const RUN_ROWS = [100, 1000, 5000];
// const RUN_ROWS = [1];

let queryCount = 0;
const setupQueryCounter = () => {
  queryCount = 0;
  const logger = {
    logQuery: (query: string, parameters?: any[], ) => {
        queryCount++;
        // console.log(`Query: ${query}, Params: ${parameters}`);
    },
    log: () => {},
  };
  (AppDataSource as any).logger = logger;
  return () => queryCount;
};
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));



describe("Single Table: User (TypeORM)", 
    () => {
    beforeAll(async () => {
      await AppDataSource.initialize();
      await AppDataSource.getRepository(User).delete({});
    });
  
    afterAll(async () => {
      await AppDataSource.destroy();
    });
  
    RUN_ROWS.forEach((rows) => {
      describe(`CRUD: ${rows} users`, () => {
        const fakeUsers: {
          name: string;
          email: string;
        }[] = [];
  
        const userIds: number[] = [];
  
        beforeAll(() => {
          for (let i = 0; i < rows; i++) {
            fakeUsers.push({
              name: faker.person.fullName(),
              email: `${i}_${faker.internet.email()}`,
            });
          }
        });
  
        it(`Create: should insert ${rows} users`, async () => {
          global.gc?.(); // Force garbage collection if available
          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- CREATE (${rows}) ---`);
          console.time(`Insert ${rows} users`);
  
          const userRepo = AppDataSource.getRepository(User);
  
          for (let user of fakeUsers) {
            const entity = userRepo.create({
              name: user.name,
              email: user.email,
            });
            const saved = await userRepo.save(entity);
            userIds.push(saved.id);
          }
  
          console.timeEnd(`Insert ${rows} users`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          await delay(2000); // Delay to allow for garbage collection

          expect(userIds.length).toBe(rows);
        }, 100000);
  
        it(`Read: should fetch all ${rows} users`, async () => {
          global.gc?.(); // Force garbage collection if available

          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- READ (${rows}) ---`);
          console.time(`Read ${rows} users`);
  
          const users = await AppDataSource.getRepository(User).find({
            where: { email: In(fakeUsers.map((user) => user.email)) },
            order: { id: "ASC" },
          });
  
          console.timeEnd(`Read ${rows} users`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          await delay(2000); // Delay to allow for garbage collection
          global.gc?.(); // Force garbage collection if available
          expect(users.length).toBe(rows);
        }, 100000);
  
        it(`Update: should update users`, async () => {
          global.gc?.(); // Force garbage collection if available

          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- UPDATE (${rows}) ---`);
          console.time(`Update ${rows} users`);
  
          const userRepo = AppDataSource.getRepository(User);
          for (const id of userIds) {
            await userRepo.update(id, { name: faker.person.fullName() });
          }
  
          console.timeEnd(`Update ${rows} users`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          await delay(2000); // Delay to allow for garbage collection
          global.gc?.(); // Force garbage collection if available
          expect(true).toBe(true);
        }, 100000);
  
        it(`Delete: should delete all users`, async () => {
          global.gc?.(); // Force garbage collection if available

          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- DELETE (${rows}) ---`);
          console.time(`Delete ${rows} users`);
  
          await AppDataSource.getRepository(User).delete({});
          const remainingUsers = await AppDataSource.getRepository(User).count();
  
          console.timeEnd(`Delete ${rows} users`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          await delay(2000); // Delay to allow for garbage collection
          global.gc?.(); // Force garbage collection if available
          expect(remainingUsers).toBeLessThanOrEqual(0);
        }, 100000);
      });
    });
  });