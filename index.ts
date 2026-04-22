// https://github.com/ollama/ollama/blob/main/docs/api.md
import ollama, { Message, Tool } from 'ollama';
import { loadTools } from './utils/tool-loader.js';
import { config } from 'dotenv';
config();

const Color = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  grey: '\x1b[90m',
  red: '\x1b[31m'
};

const [nodePath, scriptPath, ...prompt] = process.argv;

const think = process.env.THINK === '1' ? 'low' : false;
const debug = process.env.DEBUG === '1';

async function agentLoop() {
  const toolSpecs = await loadTools();
  const tools = toolSpecs
    .values()
    .toArray()
    .map(spec => spec.definition);
  console.log(`${Color.cyan}${tools.length} tools loaded; ${tools.map(tool => tool.function.name).join(' ')}\n`);

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
      think,
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
      const spec = toolSpecs.get(name);
      if (spec) {
        process.stdout.write(`\n${Color.cyan}> Tool<${name}(${JSON.stringify(call.function.arguments)})>\n`);
        const result = await spec.execute(call.function.arguments ?? {});
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
  if (debug) console.log(messages);
}

function shutdown() {
  process.stdout.write(`${Color.red}\nShutting down...${Color.reset}\n`);
  ollama.abort();
  process.exit();
}

['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT'].forEach(signal => {
  process.on(signal, shutdown);
});

agentLoop().catch(console.error);
