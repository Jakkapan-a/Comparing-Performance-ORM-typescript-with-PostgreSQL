// 
import { prisma, setupQueryCounter } from "../prisma/config";
import { de, faker } from "@faker-js/faker";

const RUN_ROWS = [100, 1000, 5000];
// const RUN_ROWS = [1];

describe("Many to Many: User - Group", () => {
    beforeAll(async () => {
        await prisma.group.deleteMany();
        await prisma.post.deleteMany();
        await prisma.category.deleteMany();
        await prisma.profile.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        // Disconnect Prisma client
        await prisma.$disconnect();
    });


    RUN_ROWS.forEach((rows) => {
        // CRUD operations for users and groups
        describe(`CRUD ${rows} users and assign to groups`, () => {
          const fakeUsers: { name: string; email: string; groupIds: number[] }[] = [];
          let groupIds: number[] = [];
          let createdUsers: { id: number; email: string }[] = [];

          beforeAll(async () => {
            const groupNames = ["Admin", "Editor", "User"];
            groupIds = [];

            for (let name of groupNames) {
              const g = await prisma.group.create({ data: { name } });
              groupIds.push(g.id);
            }

            for (let i = 0; i < rows; i++) {
              fakeUsers.push({
                name: faker.person.fullName(),
                email: `${i}_${faker.internet.email()}`,
                groupIds: [groupIds[i % 3]],
              });
            }
          });

          // Create: should insert users and link to groups
          it(`Create: should insert ${rows} users and link to groups`, async () => {
            const queryCount = setupQueryCounter();
            console.log(`--- INSERT (${rows}) ---`);
            console.time(`Insert ${rows} users`);
    
            for (let user of fakeUsers) {
              const result = await prisma.user.create({
                data: {
                  name: user.name,
                  email: user.email,
                  groups: {
                    connect: user.groupIds.map((id) => ({ id })),
                  },
                },
              });
              createdUsers.push({ id: result.id, email: result.email });
            }
    
            console.timeEnd(`Insert ${rows} users`);
            console.log(`Query Count: ${queryCount()}`);
            expect(createdUsers.length).toBe(rows);
          }, 300000);
    
          // Read: should fetch all users with groups
          it(`Read: should fetch all ${rows} users with groups`, async () => {
            const queryCount = setupQueryCounter();
            console.log(`--- READ (${rows}) ---`);
            console.time(`Read ${rows} users`);
    
            const users = await prisma.user.findMany({
              include: { groups: true },
            });
    
            console.timeEnd(`Read ${rows} users`);
            console.log(`Query Count: ${queryCount()}`);
            expect(users.length).toBe(rows);
          }, 300000);
    
          // Update: should update users' group association
          it(`Update: should update users' group association`, async () => {
            const queryCount = setupQueryCounter();
            console.log(`--- UPDATE (${rows}) ---`);
            console.time(`Update ${rows} users`);
    
            for (let i = 0; i < createdUsers.length; i++) {
              const user = createdUsers[i];
              const newGroupId = groupIds[(i + 1) % 3]; // เปลี่ยนกลุ่ม
    
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  groups: {
                    set: [{ id: newGroupId }],
                  },
                },
              });
            }

            console.timeEnd(`Update ${rows} users`);
            console.log(`Query Count: ${queryCount()}`);
            expect(true).toBe(true);
          }, 300000);
    
          it(`Delete: should delete all ${rows} users`, async () => {
            const queryCount = setupQueryCounter();
            console.log(`--- DELETE (${rows}) ---`);
            console.time(`Delete ${rows} users`);

            await prisma.user.deleteMany();    
            const remaining = await prisma.user.count();
            
            console.timeEnd(`Delete ${rows} users`);
            console.log(`Query Count: ${queryCount()}`);
            expect(remaining).toBe(0);
          }, 300000);
          
        });
    });
});