// One to Many relationship test
import { prisma, setupQueryCounter } from "../prisma/config";
import { faker } from "@faker-js/faker";

const RUN_ROWS = [1000, 5000, 10000];

describe("One to Many", () => {

  beforeAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });
  afterAll(async () => {
    // Disconnect Prisma client
    await prisma.$disconnect();
  });

  // Insert users with posts
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

      // Create: should insert users with posts
      it(`Create: should insert ${rows} users with posts`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- CREATE (${rows}) ---`);
        console.time(`Insert ${rows} users + posts`);

        for (let user of fakeUsers) {
          const result = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              posts: {
                create: user.posts,
              },
            },
            include: { posts: true },
          });

          createdUserIds.push(result.id);
          allPostIds.push(...result.posts.map((p) => p.id));
        }

        console.timeEnd(`Insert ${rows} users + posts`);
        console.log(`Query Count: ${queryCount()}`);
        expect(createdUserIds.length).toBe(rows);
        expect(allPostIds.length).toBe(rows * 2);
      }, 200000);

      // Read: should fetch all users and their posts
      it(`Read: should fetch all ${rows} users and their posts`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- READ (${rows}) ---`);
        console.time(`Read ${rows} users + posts`);

        const users = await prisma.user.findMany({
          include: { posts: true },
        });

        console.timeEnd(`Read ${rows} users + posts`);
        console.log(`Query Count: ${queryCount()}`);
        expect(users.length).toBe(rows);
      }, 100000);

      // Read: should fetch all posts with users
      it(`Update: should update post titles`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- UPDATE (${allPostIds.length}) posts ---`);
        console.time(`Update post titles`);

        for (let postId of allPostIds) {
          await prisma.post.update({
            where: { id: postId },
            data: {
              title: `Updated: ${faker.lorem.words(3)}`,
            },
          });
        }

        console.timeEnd(`Update post titles`);
        console.log(`Query Count: ${queryCount()}`);
        expect(true).toBe(true);
      }, 200000);

      // Delete: should delete all posts
      it(`Delete: should delete all users (and cascade posts)`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- DELETE (${rows}) ---`);
        console.time(`Delete all users`);
        await prisma.user.deleteMany();
        const remainingUsers = await prisma.user.count();
        const remainingPosts = await prisma.post.count();

        console.timeEnd(`Delete all users`);
        console.log(`Query Count: ${queryCount()}`);
        expect(remainingUsers).toBe(0);
        expect(remainingPosts).toBe(0);
      }, 100000);
    });
  });
});
