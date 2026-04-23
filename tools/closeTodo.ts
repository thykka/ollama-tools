import { ToolSpec } from '../types/tools';
import { closeTodo as closeTodoFn } from '../utils/todo-list';

export const closeTodo: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'closeTodo',
      description: 'Mark a persistent todo item complete',
      parameters: {
        type: 'object',
        properties: {
          pid: {
            type: 'number',
            description: 'PID of the item to complete'
          }
        },
        required: ['pid']
      }
    }
  },
  execute: _ => closeTodoFn(_?.pid)
};

export default closeTodo;
