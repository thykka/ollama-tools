import { parseDocument, DomUtils } from 'htmlparser2';
import type { ToolSpec } from '../types/tools';

const truncate = (input: string, maxLength: number = 150): string => {
  if (input.length > maxLength) {
    return input.substring(0, maxLength - 3) + '...';
  }
  return input;
};

function parseResults(html: string): string {
  const maxResults = 8;
  const dom = parseDocument(html);
  const results: unknown[] = [];
  DomUtils.findAll(node => {
    if (node.type !== 'tag' || node.name !== 'a' || !node.attribs?.href) return false;
    const href = node.attribs.href;
    if (!href.startsWith('http')) return false;
    if (href.includes('kagi.com')) return false;
    if (href.startsWith('https://web.archive.org')) return false;
    const title = DomUtils.getAttributeValue(node, 'title');
    if (!title) return false;
    const resultEls = node.parentNode?.parentNode?.parentNode?.children ?? [];
    const descriptionEl = resultEls[resultEls.length - 2];
    if (!descriptionEl) return false;
    const descriptionText = DomUtils.innerText(descriptionEl);
    const description = descriptionText.replace(/\s{2,}/g, ' ').trim();
    results.push(`${results.length + 1}. [${title}](${href})\n> ${truncate(description)}\n`);
    return false;
  }, dom);
  return `Found ${Math.min(results.length, maxResults)} results. Refer to them using the provided numbers.\n\n${results.slice(0, maxResults).join('\n')}`;
}

async function webSearchFn(query: string): Promise<string> {
  if (!process.env.KAGI_TOKEN) {
    return 'ERROR: webSearch tool requires a Kagi token';
  }
  const response = await fetch(`https://kagi.com/html/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'User-Agent': process.env.KAGI_USER_AGENT ?? 'Whip/0.0.1 (private use)',
      Cookie: `kagi_session=${process.env.KAGI_TOKEN ?? ''}`
    }
  });
  if (!response.ok) {
    if ([401, 403].includes(response.status)) {
      return 'ERROR: Invalid search token';
    }
    return `HTTP ${response.status}: ${response.statusText}`;
  }
  return parseResults(await response.text());
}

export const webSearch: ToolSpec = {
  definition: {
    type: 'function',
    function: {
      name: 'webSearch',
      description: 'Performs a web search and returns top results',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'What to search for'
          }
        }
      }
    }
  },
  execute: _ => webSearchFn(_?.query as string)
};

export default webSearch;
