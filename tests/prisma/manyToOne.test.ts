import { prisma, setupQueryCounter } from "../prisma/config";
import { de, fa, faker } from "@faker-js/faker";

const RUN_ROWS = [1000, 5000];


describe("Many to One: Post - Category", () => {
    beforeAll(async() => {
        await prisma.post.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
        console.log("Before all: Deleted all posts, categories, and users.");
    })

    afterAll(async () => {
        await prisma.$disconnect();
      });

      RUN_ROWS.forEach((rows) => {
        describe(`Insert ${rows} posts assigned to categories`, () => {
            const fakePosters: { title: string; content: string; categoryId: number }[] = [];
            let categoryIds: number[] = [];
            
            const fakeUsers: { name: string; email: string }[] = [];
            let userIds: number[] = [];
            beforeAll(async () => {
                const categories = ["Tech", "Health", "Lifestyle"];
                categoryIds = [];
                // Create categories
                for (let name of categories) {
                    const c = await prisma.category.upsert(
                        {
                            where: { name },
                            update: {},
                            create: { name },
                        })

                    // Store the category ID for later use
                    categoryIds.push(c.id);
                }                    
                // Create fake posts and assign them to categories
                for (let i = 0; i < rows; i++) {
                    fakePosters.push({
                      title: faker.lorem.sentence(),
                      content: faker.lorem.paragraph(),
                      categoryId: categoryIds[i % categories.length],
                    });
                }

                // Create fake users
                for (let i = 0; i < rows / 10; i++) {
                    const u = await prisma.user.create({
                        data: {
                            name: faker.person.fullName(),
                            email: `${i}_${faker.internet.email()}`,
                        },
                    });
                    // Store the user ID for later use
                    userIds.push(u.id);
                  }
            });

            it(`should create posts with categories`, async () => {
                const queryCount = setupQueryCounter();
                console.log(`--------------------------------`);
                
                console.time(`Insert ${rows} posts + categories`);
                for (let post of fakePosters) {
                   await prisma.post.create({
                    data:{
                        title: post.title,
                        content: post.content,
                        published: true,
                        author:{
                            connect: { id: userIds[Math.floor(Math.random() * (rows / 10))] } // Assign a random user ID from the created users
                        },
                        category: {
                            connect: { id: post.categoryId }
                        },
                    }
                   });
                  }
                console.timeEnd(`Insert ${rows} posts + categories`);
                console.log(`Query Count: ${queryCount()}`);
                expect(true).toBe(true);
            },500000); // Timeout 50s
        });
    });
})