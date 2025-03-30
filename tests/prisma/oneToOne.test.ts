// One to One relationship test
import { prisma, setupQueryCounter } from "../prisma/config";
import { faker } from "@faker-js/faker";

const RUN_ROWS = [1000, 5000, 10000];

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
        describe(`Insert ${rows} users with profiles`, () => {
            const fakeUsers: { name: string; email: string; profile: { bio: string } }[] = [];

            beforeAll(() => {
                for (let i = 0; i < rows; i++) {
                    fakeUsers.push({
                        name: faker.person.fullName(),
                        email: `${i}_${faker.internet.email()}`,
                        profile: { bio: faker.lorem.paragraph() },
                    });
                }
            });

            it(`should insert users with profiles`, async () => {
                const queryCount = setupQueryCounter();
                console.log(`--------------------------------`);

                console.time(`Insert ${rows} users + profiles`);
                for (let user of fakeUsers) {
                    await prisma.user.create({
                        data: {
                            name: user.name,
                            email: user.email,
                            profile: {
                                create: user.profile,
                            },
                        },
                    });
                }

                console.timeEnd(`Insert ${rows} users + profiles`);
                console.log(`Query Count: ${queryCount()}`);
                expect(true).toBe(true);
            }, 100000); // Timeout 10s
        });
    });
});