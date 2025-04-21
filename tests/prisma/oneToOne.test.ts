// test/prisma/oneToOne.test.ts

import { prisma, setupQueryCounter } from "../prisma/config";
import { faker } from "@faker-js/faker";
import { getMemoryUsageMB } from "../utils/memory";

const RUN_ROWS = [100, 1000, 5000];

describe("One-to-One: User - Profile", () => {
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
    describe(`CRUD: ${rows} users with profiles`, () => {
      const fakeUsers: {
        name: string;
        email: string;
        profile: { bio: string };
      }[] = [];
      const userIds: number[] = [];

      beforeAll(() => {
        for (let i = 0; i < rows; i++) {
          fakeUsers.push({
            name: faker.person.fullName(),
            email: `${i}_${faker.internet.email()}`,
            profile: { bio: faker.lorem.paragraph() },
          });
        }
      });

      it(`Create: should insert ${rows} users with profiles`, async () => {
        const queryCount = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- CREATE (${rows}) ---`);
        console.time(`Insert ${rows} users + profiles`);

        for (let user of fakeUsers) {
          const created = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              profile: { create: user.profile },
            },
            include: { profile: true },
          });
          userIds.push(created.id);
        }

        console.timeEnd(`Insert ${rows} users + profiles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );
        expect(userIds.length).toBe(rows);
      }, 200000);

      it(`Read: should fetch all ${rows} users with profiles`, async () => {
        const queryCount = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- READ (${rows}) ---`);
        console.time(`Read ${rows} users + profiles`);

        const users = await prisma.user.findMany({ include: { profile: true } });

        console.timeEnd(`Read ${rows} users + profiles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );
        expect(users.length).toBe(rows);
      }, 100000);

      it(`Update: should update profile bio for all users`, async () => {
        const queryCount = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- UPDATE (${rows}) ---`);
        console.time(`Update ${rows} profiles`);

        for (let id of userIds) {
          await prisma.profile.update({
            where: { userId: id },
            data: { bio: `Updated bio: ${faker.lorem.sentence()}` },
          });
        }

        console.timeEnd(`Update ${rows} profiles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );
        expect(true).toBe(true);
      }, 100000);

      it(`Delete: should delete all users (and cascade profiles)`, async () => {
        const queryCount = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- DELETE (${rows}) ---`);
        console.time(`Delete ${rows} users`);

        await prisma.user.deleteMany();
        const remainingUsers = await prisma.user.count();
        const remainingProfiles = await prisma.profile.count();

        console.timeEnd(`Delete ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );
        expect(remainingUsers).toBe(0);
        expect(remainingProfiles).toBe(0);
      }, 100000);
    });
  });
});
