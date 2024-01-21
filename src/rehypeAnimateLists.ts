import { visit } from 'unist-util-visit';
import type { Root } from 'hast';

export function rehypeAnimateLists(options?: { animateLists: boolean }) {
  return function (tree: Root) {
    if (!options?.animateLists) return;

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'li') return;

      node.properties.className = (node.properties.className ?? []) as string[];
      if (!node.properties.className.includes('fragment')) {
        node.properties.className.push('fragment');
      }
    });

    return tree;
  };
}
