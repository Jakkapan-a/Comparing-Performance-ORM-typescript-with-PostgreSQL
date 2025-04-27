import { faker } from "@faker-js/faker";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { Group } from "../../src/entity/Group";
import { getMemoryUsageMB } from "../utils/memory";

let queryCount = 0;
const setupQueryCounter = () => {
  queryCount = 0;
  const logger = {
    logQuery: () => queryCount++,
    logQueryError: () => {},
    logQuerySlow: () => {},
    logSchemaBuild: () => {},
    logMigration: () => {},
    log: () => {},
  };
  (AppDataSource as any).logger = logger;
  return () => queryCount;
};

const RUN_ROWS = [100, 1000, 5000];
// const RUN_ROWS = [1];

describe("Many to Many: User - Group (TypeORM)", () => {
  let groupEntities: Group[] = [];

  beforeAll(async () => {
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);
    const groupRepo = AppDataSource.getRepository(Group);

    await userRepo.delete({});
    await groupRepo.delete({});
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  RUN_ROWS.forEach((rows) => {
    describe(`CRUD ${rows} users and assign to groups`, () => {
      const fakeUsers: { name: string; email: string; group: Group }[] = [];
      let createdUsers: User[] = [];

      beforeAll(async () => {
        const groupRepo = AppDataSource.getRepository(Group);
        const groupNames = ["Admin", "Editor", "User"];
        groupEntities = [];

        for (const name of groupNames) {
          const g = groupRepo.create({ name });
          await groupRepo.save(g);
          groupEntities.push(g);
        }

        for (let i = 0; i < rows; i++) {
          fakeUsers.push({
            name: faker.person.fullName(),
            email: `${i}_${faker.internet.email()}`,
            group: groupEntities[i % 3],
          });
        }
      });

      it(`Create: should insert ${rows} users and link to groups`, async () => {
        const userRepo = AppDataSource.getRepository(User);
        
        const getQueryCount = setupQueryCounter();
        console.log(`--- CREATE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Insert ${rows} users + groups`);

        for (const user of fakeUsers) {
          const entity = userRepo.create({
            name: user.name,
            email: user.email,
            groups: [user.group],
          });
          await userRepo.save(entity);
          createdUsers.push(entity);
        }

        console.timeEnd(`Insert ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );

        expect(createdUsers.length).toBe(rows);
      }, 300000);

      it(`Read: should fetch all ${rows} users with groups`, async () => {
        const userRepo = AppDataSource.getRepository(User);
        const getQueryCount = setupQueryCounter();
        console.log(`--- READ (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Read ${rows} users`);

        const users = await userRepo.find({ relations: ["groups"] });

        console.timeEnd(`Read ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
          );
        expect(users.length).toBe(rows);
      }, 300000);

      it(`Update: should update users' group association`, async () => {
        const userRepo = AppDataSource.getRepository(User);
        const getQueryCount = setupQueryCounter();
        console.log(`--- UPDATE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Update ${rows} users`);

        for (let i = 0; i < createdUsers.length; i++) {
          const user = createdUsers[i];
          const newGroup = groupEntities[(i + 1) % 3];
          user.groups = [newGroup];
          await userRepo.save(user);
        }

        console.timeEnd(`Update ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
          );
        expect(true).toBe(true);
      }, 300000);

      it(`Delete: should delete all ${rows} users`, async () => {
        const userRepo = AppDataSource.getRepository(User);
        const getQueryCount = setupQueryCounter();
        console.log(`--- DELETE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Delete ${rows} users`);

        await userRepo.delete({});
        const remaining = await userRepo.count();

        console.timeEnd(`Delete ${rows} users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(
            `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );
        expect(remaining).toBe(0);
      }, 300000);
    });
  });
});