// https://github.com/ollama/ollama/blob/main/docs/api.md
import ollama, { Message, Tool } from 'ollama';

import type { ToolSpec } from './types/tools.js';

import { hello } from './tools/hello.js';
import { env } from './tools/env.js';
import { dice } from './tools/dice.js';
import { timeDate } from './tools/timedate.js';
import { readDir, readFile } from './tools/fs.js';

const toolSpecs: Record<string, ToolSpec> = { hello, env, dice, timeDate, readDir, readFile };
const tools: Tool[] = Object.values(toolSpecs).map(spec => spec.definition);

const DEBUG = false;

const Color = {
  reset: '\u001b[0m',
  cyan: '\u001b[36m',
  grey: '\u001b[90m'
};

const [nodePath, scriptPath, ...prompt] = process.argv;

async function agentLoop() {
  const messages: Message[] = [
    {
      role: 'user',
      content: prompt.join(' ') ?? '(blank message)'
    }
  ];

  while (true) {
    const startTime = performance.now();
    const stream = await ollama.chat({
      model: 'gemma4:e4b',
      messages,
      tools,
      think: 'low',
      stream: true,
      options: {
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64
      },
      keep_alive: '5m'
    });

    let isThinking = false;
    let content = '';
    let thinking = '';
    const toolCalls = [];

    for await (const chunk of stream) {
      if (chunk.message.thinking) {
        if (!isThinking) {
          isThinking = true;
          process.stdout.write(`${Color.grey}`);
        }
        process.stdout.write(chunk.message.thinking);
        thinking += chunk.message.thinking;
      } else if (isThinking) {
        isThinking = false;
        const thinkTime = (performance.now() - startTime) / 1000;
        process.stdout.write(`\n  (Thought for ${thinkTime.toFixed(2)}s)\n${Color.reset}`);
      }
      if (chunk.message.content) {
        process.stdout.write(chunk.message.content);
        content += chunk.message.content;
      }
      if (chunk.message.tool_calls?.length) {
        toolCalls.push(...chunk.message.tool_calls);
      }
    }

    if (thinking || content || toolCalls.length) {
      messages.push({
        role: 'agent',
        thinking,
        content,
        tool_calls: toolCalls
      });
    }

    if (!toolCalls.length) break;

    for (const call of toolCalls) {
      const { name } = call.function;
      if (name in toolSpecs) {
        const spec = toolSpecs[name as keyof typeof toolSpecs];
        process.stdout.write(`\n${Color.cyan}> Tool<${name}(${JSON.stringify(call.function.arguments)})>\n`);
        const result = spec.execute(call.function.arguments ?? {});
        process.stdout.write(`${result}${Color.reset}\n\n`);
        messages.push({ role: 'tool', tool_name: name, content: result });
      } else {
        messages.push({
          role: 'tool',
          tool_name: name,
          content: 'Unknown tool'
        });
      }
    }
  }
  process.stdout.write('\n\n');
  if (DEBUG) console.log(messages);
}

agentLoop().catch(console.error);
