// runWithMetrics.ts
import { exec } from "child_process";
import * as os from "os";
import * as fs from "fs";
import * as process from "process";

const getMemoryUsageMB = () => {
    const mem = process.memoryUsage();
    return (mem.rss / 1024 / 1024).toFixed(2); // Resident Set Size (MB)
};
const testFile = process.argv[2];

if (!testFile) {
  console.error("Please specify a test file to run.");
  process.exit(1);
}

console.log(`Collecting system metrics before test...`);

const memStart = getMemoryUsageMB();
const cpuStart = process.cpuUsage();
const startTime = Date.now();

exec(`npx jest --runInBand ${testFile}`, (error, stdout, stderr) => {
  const memEnd = getMemoryUsageMB();
  const cpuEnd = process.cpuUsage(cpuStart);
  const duration = Date.now() - startTime;

  const result = {
    testFile,
    queryTimeMs: duration,
    memoryUsed: `${memStart} → ${memEnd} MB`,
    cpuUsed: `${(cpuEnd.user / 1000).toFixed(2)} ms user / ${(cpuEnd.system / 1000).toFixed(2)} ms system`,
    system: {
      platform: os.platform(),
      cpus: os.cpus().length,
      totalMem: `${(os.totalmem() / 1024 / 1024).toFixed(0)} MB`,
    },
    output: stdout,
    logs: stderr || error?.message,
    timestamp: new Date().toISOString(),
  };
  const dateTimeFilename = new Date().toISOString().replace(/:/g, "-").replace("T", "_").split(".")[0];
  const logFileName = `performance_log_${dateTimeFilename}.json`;
  const logFilePath = `./output/${logFileName}`;
  
  if (!fs.existsSync("./output")) {
    fs.mkdirSync("./output");
  }

  fs.writeFileSync(logFilePath, JSON.stringify(result, null, 2));
  console.log("✅ Test complete. See performance_log.json for full results.");
});
