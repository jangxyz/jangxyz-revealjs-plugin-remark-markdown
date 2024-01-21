"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rehypeAnimateLists = void 0;
const unist_util_visit_1 = require("unist-util-visit");
function rehypeAnimateLists(options) {
    return function (tree) {
        if (!options?.animateLists)
            return;
        (0, unist_util_visit_1.visit)(tree, 'element', (node, index, parent) => {
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
exports.rehypeAnimateLists = rehypeAnimateLists;
