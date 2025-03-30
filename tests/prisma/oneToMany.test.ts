// One to Many relationship test
import { prisma, setupQueryCounter } from "../prisma/config";
import { faker } from "@faker-js/faker";

const RUN_ROWS = [1000, 5000, 10000];


describe("One to Many", () => {
  let count = 0;
  let userFake: any[] = [];
  const totalUsers = 10000;

  const queryCounter = setupQueryCounter();

  beforeAll(async () => {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Insert users with posts
  RUN_ROWS.forEach((rows) => {
    describe(`Insert ${rows} users with 2 posts each`, () => {
        const fakeUsers: { name: string; email: string; posts: { title: string; content: string }[] }[] = [];
        beforeAll(() => {
            for (let i = 0; i < rows; i++) {
              fakeUsers.push({
                name: faker.person.fullName(),
                email: `${i}_${faker.internet.email()}`,
                posts: [
                  { title: faker.lorem.sentence(), content: faker.lorem.paragraph() },
                  { title: faker.lorem.sentence(), content: faker.lorem.paragraph() }
                ]
              });
            }
          });

          it(`should insert users with posts`, async () => {
            const queryCount = setupQueryCounter();
            console.log(`--------------------------------`);

            console.time(`Insert ${rows} users + posts`);
            for (let user of fakeUsers) {
                await prisma.user.create({
                  data: {
                    name: user.name,
                    email: user.email,
                    posts: {
                      create: user.posts,
                    },
                  },
                });
              }
            
            console.timeEnd(`Insert ${rows} users + posts`);
            console.log(`Query Count: ${queryCount()}`);
            expect(true).toBe(true);
        },100000); // Timeout 10s
    })
  });
});
