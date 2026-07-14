/**
 * Remark plugin to extract explicit heading IDs from {/*id*\/} comments.
 * Converts: ## Heading {/*my-id*\/}
 * Into:     <h2 id="my-id">Heading</h2>
 */
import { visit } from 'unist-util-visit';

export function remarkHeadingIds() {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      if (!node.children || node.children.length === 0) return;

      const lastChild = node.children[node.children.length - 1];

      // MDX text expression: {/*id*/}
      if (lastChild && lastChild.type === 'mdxTextExpression') {
        const match = lastChild.value.match(/^\/\*(.+)\*\/$/);
        if (match) {
          node.data = node.data || {};
          node.data.hProperties = node.data.hProperties || {};
          node.data.hProperties.id = match[1].trim();
          node.children.pop();
          // Trim trailing whitespace from new last child
          const newLast = node.children[node.children.length - 1];
          if (newLast && newLast.type === 'text') {
            newLast.value = newLast.value.trimEnd();
          }
        }
      }
    });
  };
}
