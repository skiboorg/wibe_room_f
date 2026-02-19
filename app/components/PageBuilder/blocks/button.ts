// blocks/button.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const buttonBlock: BlockDefinition = {
  type: 'button',
  name: 'Кнопка',
  description: 'Кнопка действия',
  icon: '🔘',
  defaultProps: {
    content: 'Нажмите',
    variant: 'primary',
    href: ''
  }
}

const getButtonClasses = (variant: string) => {
  const variants: Record<string, string> = {
    primary: 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block',
    secondary: 'px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block',
    outline: 'px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors inline-block',
    ghost: 'px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors inline-block'
  }
  return variants[variant] || variants.primary
}

export const buttonComponent = (props: any) => {
  return h(
    props.href ? 'a' : 'button',
    {
      class: getButtonClasses(props.variant),
      contenteditable: !props.isPreview,
      suppressContentEditableWarning: true,
      href: props.href || undefined,
      onBlur: (e: any) => !props.isPreview && props['onUpdate:content']?.(e.target.innerText)
    },
    props.content
  )
}

export const buttonToHTML = (block: any) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
  const tag = block.props.href ? 'a' : 'button'
  const href = block.props.href ? ` href="${block.props.href}"` : ''
  return `<${tag}${idAttr}${href} class="${getButtonClasses(block.props.variant)}${customClass}">${block.props.content}</${tag}>\n`
}

export const buttonSettings = () => ({
  fields: [
    {
      type: 'select',
      label: 'Вариант',
      model: 'props.variant',
      options: [
        { value: 'primary', label: 'Primary - Основная' },
        { value: 'secondary', label: 'Secondary - Вторичная' },
        { value: 'outline', label: 'Outline - Контурная' },
        { value: 'ghost', label: 'Ghost - Призрачная' }
      ]
    },
    {
      type: 'text',
      label: 'Ссылка',
      model: 'props.href',
      placeholder: 'https://example.com'
    }
  ]
})
