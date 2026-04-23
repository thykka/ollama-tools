import { existsSync } from 'fs';
import { writeFile, readFile, mkdir } from 'fs/promises';

const STORAGE_PATH = './storage/';
const TODO_FILE_PATH = `${STORAGE_PATH}todo.md`;
const TODO_TEMPLATE = `# TODO`;

async function writeTodos(todos: string[] = []) {
  const filePath = TODO_FILE_PATH;
  await mkdir(STORAGE_PATH, { recursive: true });
  await writeFile(filePath, `${TODO_TEMPLATE}\n${todos.join('\n')}`);
}

async function readTodos(): Promise<string[]> {
  const filePath = TODO_FILE_PATH;
  if (!existsSync(filePath)) {
    await writeTodos();
  }
  try {
    const fileContents = await readFile(filePath, {
      encoding: 'utf-8'
    });
    return fileContents
      .trim()
      .split('\n')
      .slice(1)
      .filter(line => line.length > 0);
  } catch (error: any) {
    return [`ERROR: ${error}`];
  }
}

export async function getTodos(nextOnly?: unknown): Promise<string> {
  const todos = await readTodos();
  if (nextOnly) {
    if (todos.length === 0) return '(no todo items in list)';
    const firstOpen = todos.find(todo => todo.includes('[ ]'));
    if (!firstOpen) return '(no open todo items in list)';
    return firstOpen;
  }
  return `# TODO\n${todos.join('\n')}`;
}

export async function getTodo(pid?: unknown): Promise<string> {
  if (!pid) return 'ERROR: task `pid` is required';
  const todos = await readTodos();
  if (todos.length === 0) return 'ERROR: no todo items in list';
  const match = todos.find(todo => todo.startsWith(pid + '.'));
  if (!match) return `ERROR: Item ${pid} doesn't exist`;
  return match;
}

export async function closeTodo(pid?: unknown): Promise<string> {
  if (!pid) return 'ERROR: task `pid` is required';
  const todos = await readTodos();
  if (todos.length === 0) return 'ERROR: no todo items in list';
  const match = todos.findIndex(todo => todo.startsWith(pid + '.'));
  if (match < 0) return `ERROR: Item ${pid} doesn't exist`;
  const closed = todos[match].replace('[ ]', '[X]');
  todos.splice(match, 1, closed);
  await writeTodos(todos);
  return `Task ${pid} completed!`;
}

export async function clearTodos(all: any = false): Promise<string> {
  if (all) {
    await writeTodos([]);
    return `All tasks removed.`;
  }
  const todos = await readTodos();
  const openTodos = todos.filter(todo => todo.includes('[ ]'));
  const removedCount = todos.length - openTodos.length;
  if (removedCount === 0) return 'ERROR: no closed tasks to clear';
  await writeTodos(openTodos);
  return `${removedCount} completed tasks removed.`;
}

export async function addTodo(task: unknown): Promise<string> {
  if (!task) return 'ERROR: `task` is required';
  const todos = await readTodos();
  const lastItem = todos.at(-1)?.trim() ?? '';
  const lastPid = todos.length === 0 ? 0 : parseInt(lastItem.split('.')[0] ?? '0', 10);
  const newPid = lastPid + 1;
  todos.push(`${newPid}. [ ] ${task} (added ${new Date().toISOString()})`);
  await writeTodos(todos);
  return `Task #${newPid} added!`;
}
