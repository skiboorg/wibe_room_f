// blocks/link.ts
import { h } from 'vue'
import type { BlockDefinition } from '../types'

export const linkBlock: BlockDefinition = {
    type: 'link',
    name: 'Ссылка',
    description: 'Ссылка с контентом внутри',
    icon: '🔗',
    defaultProps: {
        href: '',
        linkType: 'external',  // 'external' или 'internal'
        target: '_self',       // '_self' или '_blank'
        rel: ''               // 'nofollow', 'noopener', etc.
    },
    allowChildren: true
}

export const linkComponent = (props: any) => {
    const children = props.children || []
    const isExternal = props.linkType === 'external'

    // Классы для визуализации ссылки
    const linkClasses = [
        'inline-block',
        !props.isPreview ? 'border-2 border-dashed border-blue-300 rounded p-2 min-h-[50px]' : '',
        'transition-colors',
        'hover:bg-blue-50'
    ].filter(Boolean).join(' ')

    return h(
        isExternal ? 'a' : 'nuxt-link',
        {
            [isExternal ? 'href' : 'to']: props.href || '#',
            target: isExternal ? props.target : undefined,
            rel: props.rel || undefined,
            class: linkClasses
        },
        children.length > 0
            ? props.renderChildren?.()
            : (!props.isPreview
                    ? h('div', {
                        class: 'text-blue-600 text-sm text-center py-2'
                    }, '🔗 Перетащите контент в ссылку')
                    : h('span', { class: 'text-blue-600 underline' }, 'Пустая ссылка')
            )
    )
}

export const linkToHTML = (block: any, renderChildren?: (children: any[]) => string) => {
    const customClass = block.customClasses ? ` ${block.customClasses}` : ''
    const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''
    const isExternal = block.props.linkType === 'external'

    const childrenHTML = block.children && renderChildren ? renderChildren(block.children) : ''

    if (isExternal) {
        // Внешняя ссылка - <a>
        const targetAttr = block.props.target ? ` target="${block.props.target}"` : ''
        const relAttr = block.props.rel ? ` rel="${block.props.rel}"` : ''

        return `<a${idAttr} href="${block.props.href || '#'}"${targetAttr}${relAttr} class="inline-block transition-colors hover:bg-blue-50${customClass}">${childrenHTML}</a>\n`
    } else {
        // Внутренняя ссылка - для Nuxt используем NuxtLink
        // В HTML экспорте это будет просто <a> с относительным путем
        return `<a${idAttr} href="${block.props.href || '#'}" class="inline-block transition-colors hover:bg-blue-50${customClass}">${childrenHTML}</a>\n`
    }
}

export const linkSettings = () => ({
    fields: [
        {
            type: 'select',
            label: 'Тип ссылки',
            model: 'props.linkType',
            options: [
                { value: 'external', label: 'Внешняя (a href)' },
                { value: 'internal', label: 'Внутренняя (nuxt-link)' }
            ]
        },
        {
            type: 'text',
            label: 'URL / Путь',
            model: 'props.href',
            placeholder: 'https://example.com или /about'
        },
        {
            type: 'select',
            label: 'Открытие',
            model: 'props.target',
            options: [
                { value: '_self', label: 'В том же окне' },
                { value: '_blank', label: 'В новом окне' }
            ]
        },
        {
            type: 'text',
            label: 'Rel атрибут',
            model: 'props.rel',
            placeholder: 'nofollow, noopener, sponsored'
        }
    ]
})