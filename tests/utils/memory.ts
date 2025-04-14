
export const getMemoryUsageMB = () => {
    const mem = process.memoryUsage();
    return (mem.rss / 1024 / 1024).toFixed(2); // Resident Set Size (MB)
  };

  export const getCPUUsage = () => {
    const usage = process.cpuUsage();
    return `${(usage.user / 1000).toFixed(2)}ms user / ${(usage.system / 1000).toFixed(2)}ms system`;
  };