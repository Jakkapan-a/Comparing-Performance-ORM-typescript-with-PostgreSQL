export const getCPUUsage = () => {
    const usage = process.cpuUsage();
    return `${(usage.user / 1000).toFixed(2)}ms user / ${(usage.system / 1000).toFixed(2)}ms system`;
  };