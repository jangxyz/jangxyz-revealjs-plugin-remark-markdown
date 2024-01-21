import { SKIP, visit } from 'unist-util-visit';
import type { ElementData, Root, Text, Element } from 'hast';
import { fromHtml } from 'hast-util-from-html';

// following https://github.com/unifiedjs/unified#plugin
export function rehypeCodeHighlight() {
  return function (tree: Root) {
    visit(tree, 'element', (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.tagName === 'code') {
        const language = (node.properties.className as string[])
          ?.find((className) => className.startsWith('language-'))
          ?.slice('language-'.length);
        if (!language) return;
        const meta = (node.data as ElementData & { meta: string })?.meta;
        if (!meta) return;
        const langData = `${language} ${meta}`;

        const code = (node.children[0] as Text).value;
        if (!code) return;

        const code2 = renderCodeHighlight(code, langData);

        const root2 = fromHtml(code2, { fragment: true });
        const node2 = (root2.children[0] as Element).children[0];

        if (parent) {
          parent.children[index] = node2;
          return SKIP;
        }
      }
    });
    return tree;
  };
}

// code from reveal.js/plugin/markdown/plugin.js
// https://github.com/hakimel/reveal.js/blob/master/plugin/markdown/plugin.js

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function renderCodeHighlight(code: string, language: string) {
  // match an optional line number offset and highlight line numbers
  // [<line numbers>] or [<offset>: <line numbers>]
  const CODE_LINE_NUMBER_REGEX = /\[\s*((\d*):)?\s*([\s\d,|-]*)\]/;

  // Off by default
  let lineNumberOffset = '';
  let lineNumbers = '';

  // Users can opt in to show line numbers and highlight
  // specific lines.
  // ```javascript []        show line numbers
  // ```javascript [1,4-8]   highlights lines 1 and 4-8
  // optional line number offset:
  // ```javascript [25: 1,4-8]   start line numbering at 25,
  //                             highlights lines 1 (numbered as 25) and 4-8 (numbered as 28-32)
  if (CODE_LINE_NUMBER_REGEX.test(language)) {
    let lineNumberOffsetMatch = language.match(CODE_LINE_NUMBER_REGEX)?.[2];
    if (lineNumberOffsetMatch) {
      lineNumberOffset = `data-ln-start-from="${lineNumberOffsetMatch.trim()}"`;
    }

    lineNumbers = language.match(CODE_LINE_NUMBER_REGEX)?.[3].trim() ?? '';
    lineNumbers = `data-line-numbers="${lineNumbers}"`;
    language = language.replace(CODE_LINE_NUMBER_REGEX, '').trim();
  }

  // Escape before this gets injected into the DOM to
  // avoid having the HTML parser alter our code before
  // highlight.js is able to read it
  code = escapeForHTML(code);

  return `<pre><code ${lineNumbers} ${lineNumberOffset} class="${language}">${code}</code></pre>`;

  //

  function escapeForHTML(input: string) {
    return input.replace(
      /([&<>'"])/g,
      (char) => HTML_ESCAPE_MAP[char as keyof typeof HTML_ESCAPE_MAP]
    );
  }
}
