import { ToolSpec } from '../types/tools';
import { clearTodos as clearTodosFn } from '../utils/todo-list';

export const clearTodos: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'clearTodo',
      description: 'Remove all completed persistent todo items',
      parameters: {
        type: 'object',
        properties: {
          all: {
            type: 'boolean',
            description: 'Setting this to true clears *all* persistent todo items - default: false'
          }
        }
      }
    }
  },
  execute: _ => clearTodosFn(_?.all)
};

export default clearTodos;
