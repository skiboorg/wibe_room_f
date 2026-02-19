// blocks/container.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const containerBlock: BlockDefinition = {
  type: 'container',
  name: 'Контейнер',
  description: 'Flex контейнер',
  icon: '📦',
  defaultProps: {
    gap: '4',
    direction: 'row'
  },
  allowChildren: true
}

export const containerComponent = (props: any) => {
  const children = props.children || []
  
  return h(
    'div',
    {
      class: `flex ${props.direction === 'column' ? 'flex-col' : 'flex-row'} gap-${props.gap} mb-4 ${!props.isPreview ? 'p-4 border-2 border-dashed border-gray-300 rounded min-h-[100px]' : ''}`
    },
    props.isPreview ? (children.length > 0 ? props.renderChildren?.() : null) : 'Flex Container (перетащите блоки сюда)'
  )
}

export const containerToHTML = (block: any, renderChildren?: (children: any[]) => string) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  const childrenHTML = block.children && renderChildren ? renderChildren(block.children) : ''
  return `<div${idAttr} class="flex ${block.props.direction === 'column' ? 'flex-col' : 'flex-row'} gap-${block.props.gap} mb-4${customClass}">${childrenHTML}</div>\n`
}

export const containerSettings = () => ({
  fields: [
    {
      type: 'select',
      label: 'Направление',
      model: 'props.direction',
      options: [
        { value: 'row', label: 'Горизонтально (row)' },
        { value: 'column', label: 'Вертикально (column)' }
      ]
    },
    {
      type: 'select',
      label: 'Отступ (gap)',
      model: 'props.gap',
      options: [
        { value: '0', label: 'Нет' },
        { value: '2', label: 'Малый' },
        { value: '4', label: 'Средний' },
        { value: '6', label: 'Большой' },
        { value: '8', label: 'Очень большой' }
      ]
    }
  ]
})
