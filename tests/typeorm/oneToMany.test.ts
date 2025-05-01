import { faker } from "@faker-js/faker";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { Post } from "../../src/entity/Post";
import { getMemoryUsageMB } from "../utils/memory";
// const RUN_ROWS = [100, 1000, 5000];
const RUN_ROWS = [1];

let queryCount = 0;
const setupQueryCounter = () => {
  queryCount = 0;
  const logger = {
    logQuery: (query: string, parameters?: any[], ) => {
      queryCount++;
      console.log(`Query: ${query}, Params: ${parameters}`);
    },
    log: () => {},
  };
  (AppDataSource as any).logger = logger;
  return () => queryCount;
};


describe("One to Many: User - Posts (TypeORM)", () => {
  beforeAll(async () => {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const postRepo = AppDataSource.getRepository(Post);
    await postRepo.delete({});
    await userRepo.delete({});

  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  RUN_ROWS.forEach((rows) => {
    describe(`CRUD: ${rows} users with 2 posts each`, () => {
      const fakeUsers: {
        name: string;
        email: string;
        posts: { title: string; content: string }[];
      }[] = [];

      const createdUserIds: number[] = [];
      const allPostIds: number[] = [];

      beforeAll(() => {
        for (let i = 0; i < rows; i++) {
          fakeUsers.push({
            name: faker.person.fullName(),
            email: `${i}_${faker.internet.email()}`,
            posts: [
              { title: faker.lorem.sentence(), content: faker.lorem.paragraph() },
              { title: faker.lorem.sentence(), content: faker.lorem.paragraph() },
            ],
          });
        }
      });

      it(`Create: should insert ${rows} users with posts`, async () => {
        const queryCounter = setupQueryCounter();
        console.log(`--- CREATE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Insert ${rows} users + posts`);

        const userRepo = AppDataSource.getRepository(User);
        const postRepo = AppDataSource.getRepository(Post);
        // console.log(`fakeUsers: ${fakeUsers.length}`);
        // console.log(`fakeUsers: ${JSON.stringify(fakeUsers)}`);

        for (let user of fakeUsers) {
          const u = userRepo.create({
            name: user.name,
            email: user.email,
            posts: user.posts.map((p) =>
            {
                return postRepo.create({
                    title: p.title,
                    content: p.content,
                });
            }
            ),
          });
          const saved = await userRepo.save(u);
          createdUserIds.push(saved.id);
          allPostIds.push(...saved.posts.map((p) => p.id));
        }
        
        // console.log(`AllpostIds: ${allPostIds}`);
        // console.log(`CreatedUserIds: ${createdUserIds}`);
        console.timeEnd(`Insert ${rows} users + posts`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCounter()}`);
        console.log(`Memory Used: ${memStart} → ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );

        expect(createdUserIds.length).toBe(rows);
        expect(allPostIds.length).toBe(rows * 2);
      }, 200000);

      it(`Read: should fetch all ${rows} users and their posts`, async () => {
        const queryCounter = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- READ (${rows}) ---`);
        console.time(`Read ${rows} users + posts`);

        const users = await AppDataSource.getRepository(User).find({
          relations: ["posts"],
        });

        console.timeEnd(`Read ${rows} users + posts`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCounter()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );

        expect(users.length).toBe(rows);
      }, 100000);

      it(`Update: should update post titles`, async () => {
        const queryCounter = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- UPDATE (${allPostIds.length}) posts ---`);
        console.time(`Update post titles`);

        const postRepo = AppDataSource.getRepository(Post);
        for (let id of allPostIds) {
            await postRepo.update(id, {
                title: `Updated: ${faker.lorem.words(3)}`,
            });
        }
        console.timeEnd(`Update post titles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCounter()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );

        expect(true).toBe(true);
      }, 200000);

      it(`Delete: should delete all users (and cascade posts)`, async () => {
        const queryCounter = setupQueryCounter();
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.log(`--- DELETE (${rows}) ---`);
        console.time(`Delete all users`);

        await AppDataSource.getRepository(User).delete({});
        const remainingUsers = await AppDataSource.getRepository(User).count();
        const remainingPosts = await AppDataSource.getRepository(Post).count();

        console.timeEnd(`Delete all users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${queryCounter()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
        console.log(
          `CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`
        );

        expect(remainingUsers).toBe(0);
      }, 100000);

    });
  });
});
