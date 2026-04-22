import { ToolSpec } from '../types/tools';

type DiceParams = {
  sides: number;
};

export function diceFn({ sides = 6 }: DiceParams): string {
  return (Math.floor(Math.random() * sides) + 1).toString();
}

export const dice: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'dice',
      description: 'Throw a dice to get a random number',
      parameters: {
        type: 'object',
        properties: {
          sides: {
            type: 'number',
            description: 'Uses n-sided dice (optional, default=6)'
          }
        }
      }
    }
  },
  execute: args => diceFn(args as DiceParams)
};

export default dice;
