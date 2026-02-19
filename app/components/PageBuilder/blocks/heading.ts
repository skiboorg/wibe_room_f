// blocks/heading.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const headingBlock: BlockDefinition = {
  type: 'heading',
  name: 'Заголовок',
  description: 'H1-H6 заголовки',
  icon: '📝',
  defaultProps: {
    content: 'Заголовок',
    level: 'h2'
  }
}

const getHeadingSize = (level: string) => {
  const sizes: Record<string, string> = {
    h1: 'text-5xl',
    h2: 'text-4xl',
    h3: 'text-3xl',
    h4: 'text-2xl',
    h5: 'text-xl',
    h6: 'text-lg'
  }
  return sizes[level] || sizes.h2
}

export const headingComponent = (props: any) => h(
  props.level || 'h2',
  {
    class: 'font-bold mb-4 ' + getHeadingSize(props.level),
    contenteditable: !props.isPreview,
    suppressContentEditableWarning: true,
    onBlur: (e: any) => !props.isPreview && props['onUpdate:content']?.(e.target.innerText)
  },
  props.content
)

export const headingToHTML = (block: any) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  return `<${block.props.level}${idAttr} class="font-bold mb-4 ${getHeadingSize(block.props.level)}${customClass}">${block.props.content}</${block.props.level}>\n`
}

export const headingSettings = (block: any, saveState: () => void) => ({
  fields: [
    {
      type: 'select',
      label: 'Уровень',
      model: 'props.level',
      options: [
        { value: 'h1', label: 'H1 - Главный заголовок' },
        { value: 'h2', label: 'H2 - Подзаголовок' },
        { value: 'h3', label: 'H3 - Секция' },
        { value: 'h4', label: 'H4 - Подсекция' },
        { value: 'h5', label: 'H5 - Мелкий заголовок' },
        { value: 'h6', label: 'H6 - Минимальный' }
      ]
    }
  ]
})
