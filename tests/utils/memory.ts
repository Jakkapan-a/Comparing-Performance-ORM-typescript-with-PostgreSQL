
export const getMemoryUsageMB = () => {
    const mem = process.memoryUsage();
    return (mem.rss / 1024 / 1024).toFixed(2); // Resident Set Size (MB)
  };
