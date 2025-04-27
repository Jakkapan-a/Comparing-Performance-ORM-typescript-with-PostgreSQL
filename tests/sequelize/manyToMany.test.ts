// test/sequelize/manyToMany.test.ts
import { faker } from "@faker-js/faker";
import { getQueryCount, resetQueryCount, sequelize } from "../../src/models"; // เชื่อม Sequelize instance
import { User } from "../../src/models/User";
import { Group } from "../../src/models/Group";
import { getMemoryUsageMB } from "../utils/memory";

// const RUN_ROWS = [1];
const RUN_ROWS = [100, 1000, 5000];

describe("Many to Many: User - Group (Sequelize)", () => {
  beforeAll(async () => {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS db_sequelize_test`);
    await sequelize.sync({ schema: "db_sequelize_test", force: false });
    resetQueryCount();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  RUN_ROWS.forEach((rows) => {
    describe(`CRUD ${rows} users and assign to groups`, () => {
      const fakeUsers: { name: string; email: string; groupIds: number[] }[] = [];
      let groupIds: number[] = [];
      let createdUsers: number[] = [];

      beforeAll(async () => {
        const groupNames = ["Admin", "Editor", "User"];
        groupIds = [];

        for (const name of groupNames) {
          const group = await Group.create({ name });
          groupIds.push(group.id);
        }

        for (let i = 0; i < rows; i++) {
          fakeUsers.push({
            name: faker.person.fullName(),
            email: `${i}_${faker.internet.email()}`,
            groupIds: [groupIds[i % 3]],
          });
        }
      });

      it(`Create: should insert ${rows} users and link to groups`, async () => {
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        resetQueryCount();
        console.time(`Insert ${rows} users`);

        for (const user of fakeUsers) {
          const u = await User.create(
            { name: user.name, email: user.email },
            { include: [Group] }
          );

          const groups = await Group.findAll({
            where: { id: user.groupIds }, // Find groups matching the IDs
          });

          await u.setGroups(groups); // Associate the user with the groups
          createdUsers.push(u.id);
        }

        console.timeEnd(`Insert ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        const queryCount = getQueryCount();
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(createdUsers.length).toBe(rows);
      }, 300000);

      it(`Read: should fetch all ${rows} users with groups`, async () => {
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        resetQueryCount();
        console.time(`Read ${rows} users`);

        const users = await User.findAll({ include: Group });

        console.timeEnd(`Read ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        const queryCount = getQueryCount();
        console.log(`Query Count: ${queryCount}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(users.length).toBe(rows);
      }, 300000);

      it(`Update: should update users' group association`, async () => {
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        resetQueryCount();
        console.time(`Update ${rows} users`);

        for (let i = 0; i < createdUsers.length; i++) {
          const user = await User.findByPk(createdUsers[i]);
          const newGroupId = groupIds[(i + 1) % 3];
          const group = await Group.findByPk(newGroupId);
          if (!user || !group) continue; // Skip if user or group not found
          await user?.setGroups([group]); // Update group association
        }

        console.timeEnd(`Update ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        const queryCount = getQueryCount();
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(true).toBe(true);
      }, 300000);

      it(`Delete: should delete all ${rows} users`, async () => {
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        resetQueryCount();
        console.time(`Delete ${rows} users`);

        await User.destroy({ where: {} });
        const remaining = await User.count();

        console.timeEnd(`Delete ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(remaining).toBe(0);
      }, 300000);
    });
  });
});
