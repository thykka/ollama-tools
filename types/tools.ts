import { Tool } from 'ollama';

export type ToolSpec = {
  definition: Tool;
  execute: (args: Record<string, unknown>) => string;
};
