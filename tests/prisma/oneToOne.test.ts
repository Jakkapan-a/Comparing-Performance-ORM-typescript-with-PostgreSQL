// One to One relationship test
import { prisma, setupQueryCounter } from "../prisma/config";
import { faker } from "@faker-js/faker";

const RUN_ROWS = [1000, 5000, 10000];
// const RUN_ROWS = [1];
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
        console.log(`--- CREATE (${rows}) ---`);
        console.time(`Insert ${rows} users + profiles`);

        for (let user of fakeUsers) {
          const created = await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              profile: {
                create: user.profile,
              },
            },
            include: { profile: true },
          });
          userIds.push(created.id);
        }

        console.timeEnd(`Insert ${rows} users + profiles`);
        console.log(`Query Count: ${queryCount()}`);
        expect(userIds.length).toBe(rows);
      }, 100000);

      it(`Read: should fetch all ${rows} users with profiles`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- READ (${rows}) ---`);
        console.time(`Read ${rows} users + profiles`);

        const users = await prisma.user.findMany({
          include: { profile: true },
        });

        console.timeEnd(`Read ${rows} users + profiles`);
        console.log(`Query Count: ${queryCount()}`);
        expect(users.length).toBe(rows);
      }, 100000);

      it(`Update: should update profile bio for all users`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- UPDATE (${rows}) ---`);
        console.time(`Update ${rows} profiles`);

        for (let id of userIds) {
          await prisma.profile.update({
            where: { userId: id },
            data: {
              bio: `Updated bio: ${faker.lorem.sentence()}`,
            },
          });
        }

        console.timeEnd(`Update ${rows} profiles`);
        console.log(`Query Count: ${queryCount()}`);
        expect(true).toBe(true);
      }, 100000);

      it(`Delete: should delete all users (and cascade profiles)`, async () => {
        const queryCount = setupQueryCounter();
        console.log(`--- DELETE (${rows}) ---`);
        console.time(`Delete ${rows} users`);
        await prisma.user.deleteMany();
        const remainingUsers = await prisma.user.count();
        const remainingProfiles = await prisma.profile.count();

        console.timeEnd(`Delete ${rows} users`);
        console.log(`Query Count: ${queryCount()}`);
        expect(remainingUsers).toBe(0);
        expect(remainingProfiles).toBe(0);
      }, 100000);
    });
  });
});
