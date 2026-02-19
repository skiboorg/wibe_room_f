// composables/useHTMLGenerator.ts
import { getBlockToHTML } from '../components/PageBuilder/blocks'
import type { Block } from '../components/PageBuilder/types'

export const generateHTML = (blocks: Block[]): string => {
  const renderBlock = (block: Block): string => {
    const toHTMLFn = getBlockToHTML(block.type)
    
    if (!toHTMLFn) {
      console.warn(`No HTML generator found for block type: ${block.type}`)
      return ''
    }

    // For blocks with children, pass a function to render them
    if (block.children && block.children.length > 0) {
      return toHTMLFn(block, (children: Block[]) => {
        return children.map(child => renderBlock(child)).join('')
      })
    }

    return toHTMLFn(block)
  }

  return blocks.map(block => renderBlock(block)).join('').trim()
}

export const useHTMLGenerator = () => {
  return {
    generateHTML
  }
}
