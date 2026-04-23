import { ToolSpec } from '../types/tools';
import { getTodo as getTodoFn } from '../utils/todo-list';

export const getTodo: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'getTodo',
      description: 'List a single persistent todo item',
      parameters: {
        type: 'object',
        properties: {
          pid: {
            type: 'number',
            description: 'PID of the item to read'
          }
        },
        required: ['pid']
      }
    }
  },
  execute: _ => getTodoFn(_?.pid as boolean)
};

export default getTodo;
