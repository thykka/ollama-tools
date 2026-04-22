import ollama, { Message, Tool } from 'ollama';
// https://github.com/ollama/ollama/blob/main/docs/api.md

type ToolName = 'hello' | 'dir';

function hello(user_name?: string): string {
  return `Hello ${user_name}! The secret is xxyyzz.`;
}

function dir(): string {
  return process.cwd();
}

const availableFunctions: Record<ToolName, Function> = {
  hello,
  dir
};

const tools: Tool[] = [
  {
    type: 'function',
    function: {
      name: 'hello',
      description: 'returns a greeting for the user',
      parameters: {
        type: 'object',
        properties: {
          user_name: {
            type: 'string',
            description: 'The user\'s name'
          },
        }
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'dir',
      description: 'returns the current directory',
    }
  }
];

async function agentLoop() {
  const messages: Message[] = [{
    role: 'user',
    content: 'What is the current directory?'
  }];

  while (true) {
    const response = await ollama.chat({
      model: 'gemma4:e4b',
      messages,
      tools,
      think: 'low',
      options: {
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64,
      },
      keep_alive: '5m'
    });

    messages.push(response.message);
    console.log(response.message);

    const toolCalls = response.message.tool_calls ?? [];
    if (!toolCalls.length) break;
    for (const call of toolCalls) {
      const fn = availableFunctions[call.function.name as ToolName];
      if (!fn) continue;
      const args = call.function.arguments as { user_name: string };
      console.log(`Calling ${call.function.name} with`, args);
      const result = fn(args);
      console.log('Result:', result);
      messages.push({ role: 'tool', tool_name: call.function.name, content: String(result) })
    }
  }
}

agentLoop().catch(console.error);
/*
const response = await ollama.chat({
  model: 'gemma4:e4b',
  stream: true,
  think: 'low',
  messages: [
    {
      role: 'user',
      content: 'Hi there! I\'m Thykka.',
    }
  ],
  tools,
  keep_alive: "15m",
  options: {
    temperature: 1.0,
    top_p: 0.95,
    top_k: 64,
  }
});

let out = '';
for await (const part of response) {
  //console.log(part);
  out += part.message.content || part.message.thinking;
  if (part.message.content === '\n\n') {
    console.log(out.trim());
    out = '';
  } else if (part.done) {
    console.log(out.trim());
    console.log('>>', part.done_reason, `${((performance.now() - start) / 1000).toFixed(2)}s`);
  }
}
*/
