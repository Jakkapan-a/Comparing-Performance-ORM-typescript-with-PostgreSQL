# Command to run the test with metrics

```bash
docker exec -it orm_test_app bash
```

1. Prisma
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/prisma/oneToOne.test.ts
npx jest -- tests/prisma/oneToOne.test.ts
```
- oneToMany
```bash
npx ts-node runWithMetrics.ts tests/prisma/oneToMany.test.ts
```
- manyToMany
```bash
npx ts-node runWithMetrics.ts tests/prisma/manyToMany.test.ts
```
2. TypeORM
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/typeorm/oneToOne.test.ts
npx jest -- tests/typeorm/oneToOne.test.ts
```
- oneToMany
```bash
npx ts-node runWithMetrics.ts tests/typeorm/oneToMany.test.ts
```
- manyToMany
```bash
npx ts-node runWithMetrics.ts tests/typeorm/manyToMany.test.ts
```

3. Sequelize
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/sequelize/oneToOne.test.ts
npx jest -- tests/sequelize/oneToOne.test.ts
```
- oneToMany
```bash
npx ts-node runWithMetrics.ts tests/sequelize/oneToMany.test.ts
```
- manyToMany
```bash
npx ts-node runWithMetrics.ts tests/sequelize/manyToMany.test.ts
```

## Summary data

