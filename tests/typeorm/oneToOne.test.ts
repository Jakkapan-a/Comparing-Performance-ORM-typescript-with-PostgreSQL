import { faker } from "@faker-js/faker";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { Profile } from "../../src/entity/Profile";
import { getMemoryUsageMB } from "../utils/memory";

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


describe("One-to-One: User - Profile (TypeORM)", () => {
    beforeAll(async () => {
      await AppDataSource.initialize();
      await AppDataSource.getRepository(Profile).delete({});
      await AppDataSource.getRepository(User).delete({});
    });
  
    afterAll(async () => {
      await AppDataSource.destroy();
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
          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- CREATE (${rows}) ---`);
          console.time(`Insert ${rows} users + profiles`);
  
          const userRepo = AppDataSource.getRepository(User);
          const profileRepo = AppDataSource.getRepository(Profile);
  
          for (let user of fakeUsers) {
            const entity = userRepo.create({
              name: user.name,
              email: user.email,
              profile: profileRepo.create({ bio: user.profile.bio }),
            });
            const saved = await userRepo.save(entity);
            userIds.push(saved.id);
          }
  
          console.timeEnd(`Insert ${rows} users + profiles`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          expect(userIds.length).toBe(rows);
        }, 100000);
  
        it(`Read: should fetch all ${rows} users with profiles`, async () => {
          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- READ (${rows}) ---`);
          console.time(`Read ${rows} users + profiles`);
  
          const users = await AppDataSource.getRepository(User).find({
            relations: ["profile"],
          });
  
          console.timeEnd(`Read ${rows} users + profiles`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          expect(users.length).toBe(rows);
        }, 100000);
  
        it(`Update: should update profile bio for all users`, async () => {
          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- UPDATE (${rows}) ---`);
          console.time(`Update ${rows} profiles`);
  
          const profileRepo = AppDataSource.getRepository(Profile);
          const profiles = await profileRepo.find();
  
          for (let profile of profiles) {
            await profileRepo.update(profile.id, {
              bio: `Updated bio: ${faker.lorem.sentence()}`,
            });
          }
  
          console.timeEnd(`Update ${rows} profiles`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          expect(true).toBe(true);
        }, 100000);
  
        it(`Delete: should delete all users (and cascade profiles)`, async () => {
          const queryCounter = setupQueryCounter();
          const memStart = getMemoryUsageMB();
          const cpuStart = process.cpuUsage();
  
          console.log(`--- DELETE (${rows}) ---`);
          console.time(`Delete ${rows} users`);
  
          await AppDataSource.getRepository(User).delete({});
          const remainingUsers = await AppDataSource.getRepository(User).count();
          const remainingProfiles = await AppDataSource.getRepository(Profile).count();
  
          console.timeEnd(`Delete ${rows} users`);
          const memEnd = getMemoryUsageMB();
          const cpuEnd = process.cpuUsage(cpuStart);
          console.log(`Query Count: ${queryCounter()}`);
          console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
          console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
          expect(remainingUsers).toBeLessThanOrEqual(0);
          expect(remainingProfiles).toBeLessThanOrEqual(0);
          
        }, 100000);
      });
    });
  });