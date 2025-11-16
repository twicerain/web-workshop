/**
 * custom rehype plugin that just adds a copy button to code blocks excluding mermaid diagrams
 */

import { visit } from 'unist-util-visit'
import { icons } from 'html'

/**
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 * @typedef {import('unified').Plugin<[], Root>} RehypePlugin
 */

/**
 * @param {ElementContent} node
 * @returns {string}
 */
function extractTextContent(node) {
  if (node.type === 'text') {
    return node.value
  }
  if ('children' in node && node.children) {
    return node.children.map(extractTextContent).join('')
  }
  return ''
}

/**
 * @type {RehypePlugin}
 */
export default function rehypeCopyCode() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'pre' && node.children.length > 0) {
        const codeNode = node.children[0]
        if (
          codeNode.type === 'element' && codeNode.tagName === 'code' && !(
            Array.isArray(codeNode.properties?.className) &&
            codeNode.properties.className.includes('language-mermaid')
          )
        ) {
          const codeText = extractTextContent(codeNode)

          /** @type {Element} */
          const wrapper = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block-wrapper'] },
            children: [
              {
                type: 'element',
                tagName: 'button',
                properties: {
                  className: ['copy-code'],
                  'aria-label': 'Copy code to clipboard',
                  'data-code': codeText,
                },
                children: [
                  {
                    type: 'raw',
                    value: icons.copy + icons.check,
                  },
                ],
              },
              {
                type: 'element',
                tagName: 'pre',
                properties: node.properties,
                children: node.children,
              },
            ],
          }

          if (parent && typeof index === 'number') {
            parent.children[index] = wrapper
          }
        }
      }
    })
  }
}
