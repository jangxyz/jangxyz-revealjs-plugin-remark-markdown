import { visit } from 'unist-util-visit';
export function rehypeAnimateLists(options) {
    return function (tree) {
        visit(tree, 'element', (node, index, parent) => {
            if (node.tagName !== 'li')
                return;
            node.properties.className = (node.properties.className ?? []);
            if (!node.properties.className.includes('fragment')) {
                node.properties.className.push('fragment');
            }
        });
        return tree;
    };
}
