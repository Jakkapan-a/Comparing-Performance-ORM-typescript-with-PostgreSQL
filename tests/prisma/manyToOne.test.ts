import { prisma, setupQueryCounter } from "../prisma/config";
import { de, fa, faker } from "@faker-js/faker";

const RUN_ROWS = [100, 1000, 5000];
// const RUN_ROWS = [1];

describe("Many to One: Post - Category", () => {
    beforeAll(async() => {
        await prisma.post.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
    })

    afterAll(async () => {
        // Disconnect Prisma client
        await prisma.$disconnect();
      });

      RUN_ROWS.forEach((rows) => {

        describe(`CRUD ${rows} posts assigned to categories`, () => {
            const fakePosts: { title: string; content: string; categoryId: number }[] = [];
            let categoryIds: number[] = [];
            const fakeUsers: { name: string; email: string }[] = [];
            let userIds: number[] = [];
            let postIds: number[] = [];
      
            beforeAll(async () => {
              const categories = ["Tech", "Health", "Lifestyle"];
              categoryIds = [];
      
              for (let name of categories) {
                const c = await prisma.category.upsert({
                  where: { name },
                  update: {},
                  create: { name },
                });
                categoryIds.push(c.id);
              }
      
              for (let i = 0; i < rows; i++) {
                fakePosts.push({
                  title: faker.lorem.sentence(),
                  content: faker.lorem.paragraph(),
                  categoryId: categoryIds[i % categories.length],
                });
              }
      
              for (let i = 0; i < rows / 10; i++) {
                const u = await prisma.user.create({
                  data: {
                    name: faker.person.fullName(),
                    email: `${i}_${faker.internet.email()}`,
                  },
                });
                userIds.push(u.id);
              }
            });
      
            it(`Create: should create ${rows} posts with categories and authors`, async () => {
              const queryCount = setupQueryCounter();
              console.time(`Insert ${rows} posts`);
      
              for (let post of fakePosts) {
                const created = await prisma.post.create({
                  data: {
                    title: post.title,
                    content: post.content,
                    published: true,
                    author: {
                      connect: { id: userIds[Math.floor(Math.random() * userIds.length)] },
                    },
                    category: {
                      connect: { id: post.categoryId },
                    },
                  },
                });
                postIds.push(created.id);
              }
      
              console.timeEnd(`Insert ${rows} posts`);
              console.log(`Query Count: ${queryCount()}`);
              expect(postIds.length).toBe(rows);
            }, 500000);
      
            it(`Read: should fetch all ${rows} posts with category`, async () => {
              const queryCount = setupQueryCounter();
              console.time(`Read ${rows} posts`);
      
              const posts = await prisma.post.findMany({
                include: { category: true, author: true },
              });
      
              console.timeEnd(`Read ${rows} posts`);
              console.log(`Query Count: ${queryCount()}`);
              expect(posts.length).toBe(rows);
            }, 100000);
      
            it(`Update: should update title and category for ${rows} posts`, async () => {
              const queryCount = setupQueryCounter();
              console.time(`Update ${rows} posts`);
      
              for (let i = 0; i < postIds.length; i++) {
                const newCategoryId = categoryIds[(i + 1) % categoryIds.length];
                await prisma.post.update({
                  where: { id: postIds[i] },
                  data: {
                    title: `Updated: ${faker.lorem.words(3)}`,
                    category: {
                      connect: { id: newCategoryId },
                    },
                  },
                });
              }
      
              console.timeEnd(`Update ${rows} posts`);
              console.log(`Query Count: ${queryCount()}`);
              expect(true).toBe(true);
            }, 500000);
      
            it(`Delete: should delete all ${rows} posts`, async () => {
              const queryCount = setupQueryCounter();
              console.time(`Delete ${rows} posts`);
      
              await prisma.post.deleteMany();
              const remaining = await prisma.post.count();
      
              console.timeEnd(`Delete ${rows} posts`);
              console.log(`Query Count: ${queryCount()}`);
              expect(remaining).toBe(0);
            }, 100000);
        });
    });
})