import { ToolSpec } from '../types/tools';
import { addTodo as addTodoFn } from '../utils/todo-list';

export const addTodo: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'addTodo',
      description: 'Add a new persistent todo item',
      parameters: {
        type: 'object',
        properties: {
          task: {
            type: 'string',
            description: 'brief, single line description for the new task'
          }
        },
        required: ['task']
      }
    }
  },
  execute: _ => addTodoFn(_?.task)
};

export default addTodo;
