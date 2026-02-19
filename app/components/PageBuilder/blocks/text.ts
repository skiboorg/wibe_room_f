// blocks/text.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const textBlock: BlockDefinition = {
  type: 'text',
  name: 'Текст',
  description: 'Параграф текста',
  icon: '📄',
  defaultProps: {
    content: 'Введите текст здесь...'
  }
}

export const textComponent = (props: any) => h(
  'p',
  {
    class: 'text-gray-700 mb-4 leading-relaxed',
    contenteditable: !props.isPreview,
    suppressContentEditableWarning: true,
    onBlur: (e: any) => !props.isPreview && props['onUpdate:content']?.(e.target.innerText)
  },
  props.content
)

export const textToHTML = (block: any) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  return `<p${idAttr} class="text-gray-700 mb-4 leading-relaxed${customClass}">${block.props.content}</p>\n`
}

export const textSettings = () => ({
  fields: []
})
