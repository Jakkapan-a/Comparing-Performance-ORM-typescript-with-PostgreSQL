// test/prisma/singleTb.test.ts

import { prisma, setupQueryCounter } from "../prisma/config";
import { de, faker } from "@faker-js/faker";
import { getMemoryUsageMB } from "../utils/memory";

// const RUN_ROWS = [100, 1000, 5000];
const RUN_ROWS = [1];

describe("Single Table: User", () => {
  beforeAll(async () => {
    await prisma.group.deleteMany();
    await prisma.post.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  RUN_ROWS.forEach((rows) => {
    describe(`CRUD: ${rows} users`, () => {
      const fakeUsers: {
        name: string;
        email: string;
      }[] = [];

      beforeAll(() => {
        for (let i = 0; i < rows; i++) {
          fakeUsers.push({
            name: faker.person.fullName(),
            email: `${i}_${faker.internet.email()}`,
          });
        }
      });

        it(`Create: should insert ${rows} users`, async () => {
            const queryCount = setupQueryCounter();
            const memStart = getMemoryUsageMB();
            const cpuStart = process.cpuUsage();
            console.log(`--- CREATE (${rows}) ---`);
            console.time(`Insert ${rows} users`);

            for (let user of fakeUsers) {
            await prisma.user.create({
                data: user,
            });
            }

            console.timeEnd(`Insert ${rows} users`);
            const memEnd = getMemoryUsageMB();
            const cpuEnd = process.cpuUsage(cpuStart);
            console.log(`Query Count: ${queryCount()}`);
            console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
            console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
            );

            expect(fakeUsers.length).toBe(rows);
        },200000); // 200000ms = 200s

        it(`Read: should read ${rows} users`, async () => {
            const queryCount = setupQueryCounter();
            const memStart = getMemoryUsageMB();
            const cpuStart = process.cpuUsage();
            console.log(`--- READ (${rows}) ---`);
            console.time(`Read ${rows} users`);

            const users = await prisma.user.findMany({
            where: { email: { in: fakeUsers.map((user) => user.email) } },
            });

            console.timeEnd(`Read ${rows} users`);
            const memEnd = getMemoryUsageMB();
            const cpuEnd = process.cpuUsage(cpuStart);
            console.log(`Query Count: ${queryCount()}`);
            console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
            console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
            );

            expect(users.length).toBe(rows);
        },200000); // 200000ms = 200s


        it(`Update: should update ${rows} users`, async () => {
            const queryCount = setupQueryCounter();
            const memStart = getMemoryUsageMB();
            const cpuStart = process.cpuUsage();
            console.log(`--- UPDATE (${rows}) ---`);
            console.time(`Update ${rows} users`);

            for (let user of fakeUsers) {
              await prisma.user.update({
                  where: { email: user.email },
                  data: { name: faker.person.fullName() },
              });
            }

            console.timeEnd(`Update ${rows} users`);
            const memEnd = getMemoryUsageMB();
            const cpuEnd = process.cpuUsage(cpuStart);
            console.log(`Query Count: ${queryCount()}`);
            console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
            console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
            );

            expect(fakeUsers.length).toBe(rows);
        },200000); // 200000ms = 200s

        it(`Delete: should delete ${rows} users`, async () => {
            const queryCount = setupQueryCounter();
            const memStart = getMemoryUsageMB();
            const cpuStart = process.cpuUsage();
            console.log(`--- DELETE (${rows}) ---`);
            console.time(`Delete ${rows} users`);
            
            await prisma.user.deleteMany();
            
            const remainingUsers = await prisma.user.count();
            console.timeEnd(`Delete ${rows} users`);
            const memEnd = getMemoryUsageMB();
            const cpuEnd = process.cpuUsage(cpuStart);
            console.log(`Query Count: ${queryCount()}`);
            console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
            console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
            );

            expect(remainingUsers).toBe(0);

        },200000); // 200000ms = 200s
        
    });
  });
});