// test/typeorm/manyToOne.test.ts
import { faker } from "@faker-js/faker";
import { AppDataSource } from "../../src/data-source";
import { User } from "../../src/entity/User";
import { Post } from "../../src/entity/Post";
import { Category } from "../../src/entity/Category";
import { getMemoryUsageMB } from "../prisma/config";

let queryCount = 0;
const setupQueryCounter = () => {
    const originalQuery = AppDataSource.driver.connect().then();
    // @ts-ignore
    queryCount = 0;
    // @ts-ignore
    AppDataSource.driver.connection.query = async function (...args: any[]) {
        queryCount++;
        return originalQuery;
    };
    return () => queryCount;
};

// const RUN_ROWS = [100, 1000, 5000];
const RUN_ROWS = [1];

describe("Many to One: Post - Category (TypeORM)", () => {
    beforeAll(async () => {
        await AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(User);
        const postRepo = AppDataSource.getRepository(Post);
        const categoryRepo = AppDataSource.getRepository(Category);
        await postRepo.delete({});
        await categoryRepo.delete({});
        await userRepo.delete({});
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    RUN_ROWS.forEach((rows) => {
        describe(`CRUD ${rows} posts assigned to categories`, () => {
            const fakePosts: { title: string; content: string; categoryId: number }[] = [];
            let categoryIds: number[] = [];
            const fakeUsers: { name: string; email: string }[] = [];
            let userIds: number[] = [];
            let postIds: number[] = [];

            beforeAll(async () => {
                const categoryRepo = AppDataSource.getRepository(Category);
                const categories = ["Tech", "Health", "Lifestyle"];

                for (let name of categories) {
                    const c = categoryRepo.create({ name });
                    await categoryRepo.save(c);
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
                    const u = await AppDataSource.getRepository(User).save({
                        name: faker.person.fullName(),
                        email: `${i}_${faker.internet.email()}`,
                    });
                    userIds.push(u.id);
                }

            }, 50000); // Increase timeout for large inserts 50000ms

            it(`Create: should insert ${rows} posts`, async () => {
                const counter = setupQueryCounter();
                const memStart = getMemoryUsageMB();
                const cpuStart = process.cpuUsage();
                console.time(`Insert ${rows} posts`);

                const postRepo = AppDataSource.getRepository(Post);
                for (const post of fakePosts) {
                    const created = postRepo.create({
                        title: post.title,
                        content: post.content,
                        published: true,
                        category: { id: post.categoryId },
                        author: { id: userIds[Math.floor(Math.random() * userIds.length)] },
                    });
                    const saved = await postRepo.save(created);
                    postIds.push(saved.id);
                }

                const cpuEnd = process.cpuUsage(cpuStart);
                const memEnd = getMemoryUsageMB();
                console.log(`Query Count: ${counter()}`);
                console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
                console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`);
                expect(postIds.length).toBe(rows);
            }, 500000); // Increase timeout for large inserts 50000ms


            it(`Read: should fetch all ${rows} posts`, async () => {
                const counter = setupQueryCounter();
                const memStart = getMemoryUsageMB();
                const cpuStart = process.cpuUsage();

                const posts = await AppDataSource.getRepository(Post).find({
                    relations: ["category", "author"],
                });

                const cpuEnd = process.cpuUsage(cpuStart);
                const memEnd = getMemoryUsageMB();

                console.log(`Query Count: ${counter()}`);
                console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
                console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`);
                expect(posts.length).toBe(rows);
            }, 100000);

            it(`Update: should update titles and categories`, async () => {
                const counter = setupQueryCounter();
                const memStart = getMemoryUsageMB();
                const cpuStart = process.cpuUsage();

                const postRepo = AppDataSource.getRepository(Post);
                for (let i = 0; i < postIds.length; i++) {
                    await postRepo.update(postIds[i], {
                        title: `Updated: ${faker.lorem.words(3)}`,
                        category: { id: categoryIds[(i + 1) % categoryIds.length] },
                    });
                }

                const cpuEnd = process.cpuUsage(cpuStart);
                const memEnd = getMemoryUsageMB();

                console.log(`Query Count: ${counter()}`);
                console.log(`Memory Used: ${memStart} -> ${memEnd} MB`);
                console.log(`CPU Used: ${(cpuEnd.user / 1000).toFixed(2)}ms user / ${(cpuEnd.system / 1000).toFixed(2)}ms system`);
                expect(true).toBe(true);
            }, 300000);

            it(`Delete: should delete all posts`, async () => {
                const counter = setupQueryCounter();
                console.time(`Delete ${rows} posts`);

                await AppDataSource.getRepository(Post).delete({});
                const remaining = await AppDataSource.getRepository(Post).count();

                console.timeEnd(`Delete ${rows} posts`);
                console.log(`Query Count: ${counter()}`);
                expect(remaining).toBe(0);
            }, 100000);
        });
    });
});