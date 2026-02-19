// blocks/image.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const imageBlock: BlockDefinition = {
  type: 'image',
  name: 'Изображение',
  description: 'Блок изображения',
  icon: '🖼️',
  defaultProps: {
    src: 'https://placehold.co/800x400',
    alt: 'Placeholder image'
  }
}

export const imageComponent = (props: any) => h('img', {
  src: props.src,
  alt: props.alt,
  class: 'w-full h-auto rounded-lg mb-4 object-cover'
})

export const imageToHTML = (block: any) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  return `<img${idAttr} src="${block.props.src}" alt="${block.props.alt}" class="w-full h-auto rounded-lg mb-4 object-cover${customClass}" />\n`
}

export const imageSettings = () => ({
  fields: [
    {
      type: 'text',
      label: 'URL изображения',
      model: 'props.src',
      placeholder: 'https://example.com/image.jpg'
    },
    {
      type: 'text',
      label: 'Alt текст',
      model: 'props.alt',
      placeholder: 'Описание изображения'
    }
  ]
})
