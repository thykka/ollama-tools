import os from 'os';
import { ToolSpec } from '../types/tools';

export function envFn(): string {
  return JSON.stringify({
    os: {
      platform: os.platform(),
      version: os.release(),
      type: os.type(),
      uptime: os.uptime()
    },
    nodejs: {
      version: process.version
    },
    cpu: {
      count: os.cpus().length,
      model: os.cpus()[0]?.model || 'unknown',
      speed: os.cpus()[0]?.speed || -1,
      architecture: os.arch()
    },
    ram: {
      total: os.totalmem(),
      free: os.freemem()
    },
    user: os.userInfo(),
    hostname: os.hostname()
  });
}

export const env: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'env',
      description: 'provides environment and system information'
    }
  },
  execute: _ => envFn()
};

export default env;
