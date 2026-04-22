import { normalize } from 'path';
import { readdirSync, readFileSync } from 'fs';
import { ToolSpec } from '../types/tools';

type ReadDirParams = {
  path?: string;
};

export function readDirFn({ path }: ReadDirParams): string {
  const entries = readdirSync(normalize(path ?? process.cwd()), { encoding: 'utf-8', withFileTypes: true });
  const sortedEntries = entries.sort((a, b) => {
    const aDir = a.isDirectory();
    const bDir = b.isDirectory();
    if ((aDir && bDir) || !(aDir || bDir)) {
      return a.name.localeCompare(b.name);
    }
    return aDir ? -1 : 1;
  });
  return sortedEntries.map(entry => entry.name + (entry.isDirectory() ? '/' : '')).join('\n');
}

export const readDir: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'readDir',
      description: "Lists directory entries from user's local system",
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to directory (optional, defaults to cwd)'
          }
        }
      }
    }
  },
  execute: args => readDirFn(args as ReadDirParams)
};

type ReadFileParams = {
  path?: string;
};

export function readFileFn({ path }: ReadFileParams): string {
  if (!path) return 'ERROR: `path` is required';
  const file = readFileSync(normalize(path ?? process.cwd()), { encoding: 'utf-8' });
  if (file.length > 4096) {
    return file.slice(0, 4000) + '\n\n(Output truncated)';
  }
  return file;
}

export const readFile: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'readFile',
      description: "Reads a plain text file from user's local system",
      parameters: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'Path to the file'
          }
        }
      }
    }
  },
  execute: args => readFileFn(args as ReadFileParams)
};
