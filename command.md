# Command to run the test with metrics

```bash
docker exec -it orm_test_app bash
```

1. Prisma
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/prisma/oneToOne.test.ts
npx ts-node summarizeIO.ts
npx jest -- tests/prisma/oneToOne.test.ts
```
- oneToMany
```bash
npx ts-node runWithMetrics.ts tests/prisma/oneToMany.test.ts
npx ts-node summarizeIO.ts
```
- manyToMany
```bash
npx ts-node runWithMetrics.ts tests/prisma/manyToMany.test.ts
npx ts-node summarizeIO.ts
```
2. TypeORM
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/typeorm/oneToOne.test.ts
npx ts-node summarizeIO.ts
npx jest -- tests/typeorm/oneToOne.test.ts
```
- oneToMany
```bash
npx ts-node runWithMetrics.ts tests/typeorm/oneToMany.test.ts
npx ts-node summarizeIO.ts
```
- manyToMany
```bash
npx ts-node runWithMetrics.ts tests/typeorm/manyToMany.test.ts
npx ts-node summarizeIO.ts
```

3. Sequelize
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/sequelize/oneToOne.test.ts
npx ts-node summarizeIO.ts
npx jest -- tests/sequelize/oneToOne.test.ts
```
- oneToMany
```bash
npx ts-node runWithMetrics.ts tests/sequelize/oneToMany.test.ts
npx ts-node summarizeIO.ts
```
- manyToMany
```bash
npx ts-node runWithMetrics.ts tests/sequelize/manyToMany.test.ts
npx ts-node summarizeIO.ts
```

## Summary data

