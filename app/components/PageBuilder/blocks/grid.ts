// blocks/grid.ts - АДАПТИВНАЯ ВЕРСИЯ
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const gridBlock: BlockDefinition = {
  type: 'grid',
  name: 'Сетка',
  description: 'Адаптивная Grid сетка',
  icon: '⬜⬜',
  defaultProps: {
    columns: 2,          // Desktop (lg+)
    columnsMd: 2,        // Tablet (md)
    columnsSm: 1,        // Mobile (sm)
    gap: '4',
    columnData: {}
  },
  allowChildren: false
}

export const gridComponent = (props: any) => {
  const columnData = props.columnData || {}
  const columns = props.columns || 2
  const columnsSm = props.columnsSm ?? 1
  const columnsMd = props.columnsMd ?? columns

  // Адаптивные Tailwind классы
  const gridClasses = [
    'grid',
    `grid-cols-${columnsSm}`,              // Mobile по умолчанию
    `md:grid-cols-${columnsMd}`,           // Tablet
    `lg:grid-cols-${columns}`,             // Desktop
    `gap-${props.gap}`,
    'mb-4',
    !props.isPreview ? 'min-h-[200px]' : ''
  ].filter(Boolean).join(' ')

  return h(
      'div',
      {
        class: gridClasses
      },
      // Создаем колонки (по максимальному количеству для desktop)
      Array.from({ length: columns }).map((_, colIndex) => {
        const columnBlocks = columnData[colIndex] || []

        return h(
            'div',
            {
              key: colIndex,
              class: `${!props.isPreview ? 'border-2 border-dashed border-gray-300 rounded p-2 min-h-[100px]' : ''}`,
              'data-column-index': colIndex,
              onDrop: (e: DragEvent) => {
                if (props.onColumnDrop) {
                  props.onColumnDrop(colIndex, e)
                }
              },
              onDragover: (e: Event) => e.preventDefault(),
              onDragenter: (e: Event) => e.preventDefault()
            },
            columnBlocks.length > 0
                ? (props.renderColumn?.(colIndex) || null)
                : (!props.isPreview
                        ? h('div', {
                          class: 'text-gray-400 text-sm text-center py-8'
                        }, `Колонка ${colIndex + 1}`)
                        : null
                )
        )
      })
  )
}

export const gridToHTML = (block: any, renderChildren?: (children: any[]) => string) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  const columnData = block.props.columnData || {}
  const columns = block.props.columns || 2
  const columnsSm = block.props.columnsSm ?? 1
  const columnsMd = block.props.columnsMd ?? columns

  // Адаптивные классы для HTML
  const gridClasses = [
    'grid',
    `grid-cols-${columnsSm}`,
    `md:grid-cols-${columnsMd}`,
    `lg:grid-cols-${columns}`,
    `gap-${block.props.gap}`,
    'mb-4'
  ].join(' ')

  // Генерируем HTML для каждой колонки
  const columnsHTML = Array.from({ length: columns }).map((_, colIndex) => {
    const columnBlocks = columnData[colIndex] || []

    if (columnBlocks.length > 0 && renderChildren) {
      const columnHTML = columnBlocks.map((childBlock: any) => {
        const blockRegistry = require('./index')
        const toHTMLFn = blockRegistry.getBlockToHTML(childBlock.type)
        if (toHTMLFn) {
          return toHTMLFn(childBlock, renderChildren)
        }
        return ''
      }).join('')
      return `<div>${columnHTML}</div>`
    }
    return '<div></div>'
  }).join('')

  return `<div${idAttr} class="${gridClasses}${customClass}">${columnsHTML}</div>\n`
}

export const gridSettings = () => ({
  fields: [
    {
      type: 'select',
      label: '🖥️ Колонки Desktop (lg)',
      model: 'props.columns',
      options: [
        { value: 1, label: '1 колонка' },
        { value: 2, label: '2 колонки' },
        { value: 3, label: '3 колонки' },
        { value: 4, label: '4 колонки' },
        { value: 6, label: '6 колонок' }
      ]
    },
    {
      type: 'select',
      label: '📱 Колонки Tablet (md)',
      model: 'props.columnsMd',
      options: [
        { value: 1, label: '1 колонка' },
        { value: 2, label: '2 колонки' },
        { value: 3, label: '3 колонки' },
        { value: 4, label: '4 колонки' }
      ]
    },
    {
      type: 'select',
      label: '📱 Колонки Mobile (sm)',
      model: 'props.columnsSm',
      options: [
        { value: 1, label: '1 колонка' },
        { value: 2, label: '2 колонки' }
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