import { faker } from "@faker-js/faker";
import { getMemoryUsageMB } from "../utils/memory";
import { getQueryCount, resetQueryCount, sequelize } from "../../src/models";
import { User } from "../../src/models/User";
import { Post } from "../../src/models/Post";

// const RUN_ROWS = [1]; // ทดสอบเริ่มต้นที่ 100 ก่อน
const RUN_ROWS = [100, 1000, 5000];

describe("One to Many: User - Posts (Sequelize)", () => {
  beforeAll(async () => {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS db_sequelize_test`);
    await sequelize.sync({ schema: "db_sequelize_test", force: true });
    resetQueryCount();
  });

  afterAll(async () => {
    await sequelize.close();
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
        resetQueryCount();
        console.log(`--- CREATE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Insert ${rows} users + posts`);

        for (let user of fakeUsers) {
          const created = await User.create(
            {
              name: user.name,
              email: user.email,
              posts: user.posts,
            },
            { include: [Post] }
          );

          createdUserIds.push(created.id);
          const posts = await created.$get("posts");
          allPostIds.push(...posts.map((p) => p.id));
        }

        console.timeEnd(`Insert ${rows} users + posts`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(createdUserIds.length).toBe(rows);
        expect(allPostIds.length).toBe(rows * 2);
      }, 200000);

      it(`Read: should fetch all ${rows} users and their posts`, async () => {
        resetQueryCount();
        console.log(`--- READ (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Read ${rows} users + posts`);

        const users = await User.findAll({ include: [Post] });

        console.timeEnd(`Read ${rows} users + posts`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(users.length).toBe(rows);
      }, 100000);

      it(`Update: should update post titles`, async () => {
        resetQueryCount();
        console.log(`--- UPDATE (${allPostIds.length}) posts ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Update post titles`);

        for (let postId of allPostIds) {
          await Post.update(
            { title: `Updated: ${faker.lorem.words(3)}` },
            { where: { id: postId } }
          );
        }

        console.timeEnd(`Update post titles`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(true).toBe(true);
      }, 200000);

      it(`Delete: should delete all users (and cascade posts)`, async () => {
        resetQueryCount();
        console.log(`--- DELETE (${rows}) ---`);
        const memStart = getMemoryUsageMB();
        const cpuStart = process.cpuUsage();
        console.time(`Delete all users`);

        await User.destroy({ where: {} });
        const remainingUsers = await User.count();
        const remainingPosts = await Post.count();

        console.timeEnd(`Delete all users`);
        const memEnd = getMemoryUsageMB();
        const cpuEnd = process.cpuUsage(cpuStart);
        console.log(`Query Count: ${getQueryCount()}`);
        console.log(`Memory Used: ${memStart} -> ${memEnd} MB, (${(parseFloat(memEnd) - parseFloat(memStart)).toFixed(2)} MB)`);
        console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms / ${(cpuEnd.system / 1000).toFixed(2)}ms`);
        expect(remainingUsers).toBe(0);
      }, 100000);
    });
  });
});
