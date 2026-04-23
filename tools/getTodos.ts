import { ToolSpec } from '../types/tools';
import { getTodos as getTodosFn } from '../utils/todo-list';

export const getTodos: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'getTodos',
      description: 'Display the persistent todo list',
      parameters: {
        type: 'object',
        properties: {
          nextOnly: {
            type: 'boolean',
            description: 'Only show the next open item - default: false'
          }
        }
      }
    }
  },
  execute: _ => getTodosFn(_?.nextOnly as boolean)
};

export default getTodos;
