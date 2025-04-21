# Command to run the test with metrics

<!-- Docker remote (orm_test_app) -->
```bash
docker exec -it orm_test_app bash
```

1. Prisma
- oneToOne
```bash
npx ts-node runWithMetrics.ts tests/prisma/oneToOne.test.ts
npx ts-node summarizeIO.ts
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

