// blocks/divider.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const dividerBlock: BlockDefinition = {
  type: 'divider',
  name: 'Разделитель',
  description: 'Горизонтальная линия',
  icon: '➖',
  defaultProps: {
    style: 'solid'
  }
}

export const dividerComponent = (props: any) => h('hr', {
  class: `my-8 ${props.style === 'dashed' ? 'border-dashed' : 'border-solid'} border-gray-300`
})

export const dividerToHTML = (block: any) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  return `<hr${idAttr} class="my-8 ${block.props.style === 'dashed' ? 'border-dashed' : 'border-solid'} border-gray-300${customClass}" />\n`
}

export const dividerSettings = () => ({
  fields: [
    {
      type: 'select',
      label: 'Стиль',
      model: 'props.style',
      options: [
        { value: 'solid', label: 'Сплошная' },
        { value: 'dashed', label: 'Пунктирная' }
      ]
    }
  ]
})

// blocks/spacer.ts
export const spacerBlock: BlockDefinition = {
  type: 'spacer',
  name: 'Отступ',
  description: 'Пустое пространство',
  icon: '⬜',
  defaultProps: {
    height: '4'
  }
}

export const spacerComponent = (props: any) => h('div', {
  class: `h-${props.height} ${!props.isPreview ? 'bg-gray-100 border border-dashed border-gray-300' : ''}`
})

export const spacerToHTML = (block: any) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  return `<div${idAttr} class="h-${block.props.height}${customClass}"></div>\n`
}

export const spacerSettings = () => ({
  fields: [
    {
      type: 'select',
      label: 'Высота',
      model: 'props.height',
      options: [
        { value: '2', label: 'Очень малый (8px)' },
        { value: '4', label: 'Малый (16px)' },
        { value: '8', label: 'Средний (32px)' },
        { value: '16', label: 'Большой (64px)' },
        { value: '24', label: 'Очень большой (96px)' }
      ]
    }
  ]
})
