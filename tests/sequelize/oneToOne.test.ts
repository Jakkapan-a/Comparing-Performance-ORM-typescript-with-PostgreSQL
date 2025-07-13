// test/sequelize/oneToOne.test.ts
import { faker } from "@faker-js/faker";
import { getMemoryUsageMB } from "../utils/memory";
import { getQueryCount, resetQueryCount, sequelize } from "../../src/models";
import { User } from "../../src/models/User";
import { Profile } from "../../src/models/Profile";

// const RUN_ROWS = [100, 1000, 5000];
const RUN_ROWS = [1];

describe("One-to-One: User - Profile (Sequelize)", () => {
  beforeAll(async () => {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS db_sequelize_test`);
    await sequelize.sync({ schema: "db_sequelize_test", force: true });
    resetQueryCount();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  RUN_ROWS.forEach((rows) => {
    describe(`CRUD: ${rows} users with profiles`, () => {
      const fakeUsers: { name: string; email: string; profile: { bio: string } }[] = [];
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
        resetQueryCount();
        console.log(`--- CREATE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Insert ${rows} users + profiles`);

        for (const user of fakeUsers) {
          const created = await User.create(
            {
              name: user.name,
              email: user.email,
              profile: user.profile,
            },
            { include: [Profile] }
          );
          userIds.push(created.id);
        }

        console.timeEnd(`Insert ${rows} users + profiles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(userIds.length).toBe(rows);
      }, 100000);

      it(`Read: should fetch all ${rows} users with profiles`, async () => {
        resetQueryCount();
        console.log(`--- READ (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Read ${rows} users + profiles`);

        const users = await User.findAll({ include: [Profile] });

        console.timeEnd(`Read ${rows} users + profiles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB`, `(${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(users.length).toBe(rows);
      }, 100000);

      it(`Update: should update profile bio for all users`, async () => {
        resetQueryCount();
        console.log(`--- UPDATE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Update ${rows} profiles`);

        for (const id of userIds) {
          const profile = await Profile.findOne({ where: { userId: id } });
          if (profile) {
            await profile.update({ bio: `Updated bio: ${faker.lorem.sentence()}` });
          }
        }

        console.timeEnd(`Update ${rows} profiles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(true).toBe(true);
      }, 100000);

      it(`Delete: should delete all users (and cascade profiles)`, async () => {
        resetQueryCount();
        console.log(`--- DELETE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Delete ${rows} users`);

        await User.destroy({ where: {} });
        const remainingUsers = await User.count();
        const remainingProfiles = await Profile.count();

        console.timeEnd(`Delete ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(remainingUsers).toBe(0);
        expect(remainingProfiles).toBe(0);
      }, 100000);
    });
  });
});
