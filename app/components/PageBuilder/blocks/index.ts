// blocks/index.ts
// Автоматический реестр всех блоков

import { headingBlock, headingComponent, headingToHTML, headingSettings } from './heading'
import { textBlock, textComponent, textToHTML, textSettings } from './text'
import { buttonBlock, buttonComponent, buttonToHTML, buttonSettings } from './button'
import { imageBlock, imageComponent, imageToHTML, imageSettings } from './image'
import { containerBlock, containerComponent, containerToHTML, containerSettings } from './container'
import { gridBlock, gridComponent, gridToHTML, gridSettings } from './grid'
import { dividerBlock, dividerComponent, dividerToHTML, dividerSettings } from './divider'
import { spacerBlock, spacerComponent, spacerToHTML, spacerSettings } from './divider'
import { linkBlock, linkComponent, linkToHTML, linkSettings } from './link'
import type { BlockDefinition } from '../types'

interface BlockRegistry {
  definition: BlockDefinition
  component: (props: any) => any
  toHTML: (block: any, renderChildren?: (children: any[]) => string) => string
  settings: (block: any, saveState: () => void) => any
}

// Реестр всех блоков
export const blockRegistry: Record<string, BlockRegistry> = {
  heading: {
    definition: headingBlock,
    component: headingComponent,
    toHTML: headingToHTML,
    settings: headingSettings
  },
  text: {
    definition: textBlock,
    component: textComponent,
    toHTML: textToHTML,
    settings: textSettings
  },
  button: {
    definition: buttonBlock,
    component: buttonComponent,
    toHTML: buttonToHTML,
    settings: buttonSettings
  },
  image: {
    definition: imageBlock,
    component: imageComponent,
    toHTML: imageToHTML,
    settings: imageSettings
  },
  container: {
    definition: containerBlock,
    component: containerComponent,
    toHTML: containerToHTML,
    settings: containerSettings
  },
  grid: {
    definition: gridBlock,
    component: gridComponent,
    toHTML: gridToHTML,
    settings: gridSettings
  },
  divider: {
    definition: dividerBlock,
    component: dividerComponent,
    toHTML: dividerToHTML,
    settings: dividerSettings
  },
  spacer: {
    definition: spacerBlock,
    component: spacerComponent,
    toHTML: spacerToHTML,
    settings: spacerSettings
  },
  link: {
    definition: linkBlock,
    component: linkComponent,
    toHTML: linkToHTML,
    settings: linkSettings
  }
}

// Получить все определения блоков
export const getAllBlockDefinitions = (): BlockDefinition[] => {
  return Object.values(blockRegistry).map(reg => reg.definition)
}

// Получить компонент блока
export const getBlockComponent = (blockType: string) => {
  return blockRegistry[blockType]?.component
}

// Получить HTML генератор блока
export const getBlockToHTML = (blockType: string) => {
  return blockRegistry[blockType]?.toHTML
}

// Получить настройки блока
export const getBlockSettings = (blockType: string) => {
  return blockRegistry[blockType]?.settings
}

// Проверить, поддерживает ли блок детей
export const blockAllowsChildren = (blockType: string): boolean => {
  return blockRegistry[blockType]?.definition.allowChildren || false
}