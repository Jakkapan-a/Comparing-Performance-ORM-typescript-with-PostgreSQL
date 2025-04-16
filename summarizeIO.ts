// summarizeIO.ts
import { Client } from "pg";
import * as fs from "fs";
import * as path from "path";

const client = new Client({
  host: "localhost",
  port: 6433,
  user: "postgres",
  password: "postgres",
  database: "mydb",
});

async function summarizeIOResults() {
  await client.connect();

  const result = await client.query(`
    SELECT
      query,
      sum(shared_blks_read) AS disk_reads,
      sum(shared_blks_written) AS disk_writes,
      sum(temp_blks_read) AS temp_reads,
      sum(temp_blks_written) AS temp_writes,
      sum(total_exec_time) AS total_exec_time,
      count(*) AS total_queries
    FROM pg_stat_statements
    WHERE query LIKE '%db_sequelize_test%' -- ปรับตาม schema ของคุณ
    GROUP BY query
    ORDER BY total_exec_time DESC
    LIMIT 20;
  `);

  const outputPath = path.join("./output", `io_summary_${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(result.rows, null, 2));
  console.log("✅ I/O Summary saved to:", outputPath);

  await client.end();
}

summarizeIOResults().catch((err) => {
  console.error("Error during I/O summary:", err);
  client.end();
});
