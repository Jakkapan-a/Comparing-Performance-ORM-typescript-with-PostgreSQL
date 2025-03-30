// 
import { prisma, setupQueryCounter } from "../prisma/config";
import { de, faker } from "@faker-js/faker";

const RUN_ROWS = [1000, 5000, 10000];

describe("Many to Many: User - Group", () => {
    beforeAll(async () => {
        await prisma.group.deleteMany();
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    RUN_ROWS.forEach((rows) => {
        describe(`Insert ${rows} users and assign to groups`, () => {
            const fakeUsers: { name: string; email: string; groupIds: number[] }[] = [];
            let groupIds: number[] = [];

            beforeAll(async () => {
                const groupNames = ["Admin", "Editor", "User"];
                groupIds = [];
                // Create groups
                for (let name of groupNames) {
                    const g = await prisma.group.create({ data: { name } });
                    groupIds.push(g.id);
                  }

                // Create fake users and assign them to groups
                for (let i = 0; i < rows; i++) {
                    fakeUsers.push({
                      name: faker.person.fullName(),
                      email: `${i}_${faker.internet.email()}`,
                      groupIds: [groupIds[i % 3]],
                    });
                  }
            });

            afterAll(async () => {});

            it(`should create users and link to groups`, async () => {
                const queryCount = setupQueryCounter();
                console.log(`--------------------------------`);
                
                console.time(`Insert ${rows} users + groups`);
                for (let user of fakeUsers) {
                    await prisma.user.create({
                      data: {
                        name: user.name,
                        email: user.email,
                        groups: {
                          connect: user.groupIds.map((id) => ({ id })),
                        },
                      },
                    });
                  }
                
                console.timeEnd(`Insert ${rows} users + groups`);
                console.log(`Query Count: ${queryCount()}`);
                expect(true).toBe(true);
            }, 100000); // Timeout 10s
        });
    });
});