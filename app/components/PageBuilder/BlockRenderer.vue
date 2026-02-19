<template>
  <draggable
      :model-value="blocks"
      @update:model-value="handleUpdate"
      :animation="200"
      :disabled="isPreview"
      handle=".drag-handle"
      ghost-class="ghost"
      :group="{ name: 'blocks', pull: true, put: true }"
      class="space-y-4"
      item-key="id"
  >
    <template #item="{ element }">
      <div
          :key="element.id"
          @click.stop="!isPreview && $emit('select', element.id)"
          :class="[
          'group relative transition-all',
          !isPreview && selectedId === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : '',
          !isPreview ? 'hover:ring-2 hover:ring-gray-300' : ''
        ]"
      >
        <!-- Block Controls -->
        <div
            v-if="!isPreview"
            class="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10"
        >
          <button class="drag-handle px-2 py-1 bg-gray-800 text-white text-xs rounded cursor-move hover:bg-gray-700">
            ⋮⋮
          </button>
          <button
              @click.stop="$emit('duplicate', element.id)"
              class="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
              title="Дублировать"
          >
            📋
          </button>
          <button
              @click.stop="$emit('moveUp', element.id)"
              class="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
              title="Вверх"
          >
            ↑
          </button>
          <button
              @click.stop="$emit('moveDown', element.id)"
              class="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
              title="Вниз"
          >
            ↓
          </button>
          <button
              @click.stop="$emit('delete', element.id)"
              class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
              title="Удалить"
          >
            🗑️
          </button>
        </div>

        <!-- Grid Block - special handling -->
        <component
            v-if="element.type === 'grid'"
            :is="getComponent(element)"
            v-bind="{
              ...element.props,
              isPreview,
              renderColumn: (colIndex) => renderGridColumn(element, colIndex),
              onColumnDrop: (colIndex, event) => onDropInGridColumn(event, element, colIndex)
            }"
            :id="element.htmlId"
            :class="element.customClasses"
        />

        <!-- Block Content with Drop Zone for containers -->
        <div
            v-else-if="allowsChildren(element.type)"
            @drop="onDropInside($event, element)"
            @dragover.prevent
            @dragenter.prevent
        >
          <component
              :is="getComponent(element)"
              v-bind="{
                ...element.props,
                isPreview,
                children: element.children,
                renderChildren: () => renderChildren(element)
              }"
              :id="element.htmlId"
              :class="element.customClasses"
              @update:content="(val: string) => updateContent(element, val)"
          />
        </div>

        <!-- Regular blocks without drop zone -->
        <component
            v-else
            :is="getComponent(element)"
            v-bind="{
              ...element.props,
              isPreview,
              children: element.children,
              renderChildren: () => renderChildren(element)
            }"
            :id="element.htmlId"
            :class="element.customClasses"
            @update:content="(val: string) => updateContent(element, val)"
        />
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { h, getCurrentInstance } from 'vue'
import draggable from 'vuedraggable'
import { getBlockComponent, blockAllowsChildren, getAllBlockDefinitions } from '../PageBuilder/blocks'
import type { Block } from '../PageBuilder/types'

// Get current component for recursion
const instance = getCurrentInstance()

// Props
const props = defineProps<{
  blocks: Block[]
  selectedId?: string
  isPreview: boolean
}>()

// Emits
const emit = defineEmits<{
  'update:blocks': [blocks: Block[]]
  select: [id: string]
  update: [id: string, updates: Partial<Block>]
  delete: [id: string]
  duplicate: [id: string]
  moveUp: [id: string]
  moveDown: [id: string]
  saveState: []
}>()

// Get available blocks for drop
const availableBlocks = getAllBlockDefinitions()

// Get block component
const getComponent = (block: Block) => {
  const component = getBlockComponent(block.type)
  return component || (() => h('div', {}, 'Unknown block type'))
}

// Check if block allows children
const allowsChildren = (blockType: string) => {
  return blockAllowsChildren(blockType)
}

// Update block content
const updateContent = (block: Block, newContent: string) => {
  emit('update', block.id, {
    props: { ...block.props, content: newContent }
  })
}

// Handle draggable update
const handleUpdate = (newBlocks: Block[]) => {
  emit('update:blocks', newBlocks)
  emit('saveState')
}

// Handle drop inside container (NOT grid)
const onDropInside = (event: DragEvent, parentBlock: Block) => {
  event.stopPropagation()
  event.preventDefault()

  if (!event.dataTransfer) return

  const blockType = event.dataTransfer.getData('blockType')
  if (!blockType) return

  const blockDef = availableBlocks.find(b => b.type === blockType)
  if (!blockDef) return

  // Create new block
  const newBlock: Block = {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: blockType,
    props: { ...blockDef.defaultProps },
    customClasses: '',
    htmlId: '',
    children: blockDef.allowChildren ? [] : undefined
  }

  // Add to parent's children
  if (!parentBlock.children) {
    parentBlock.children = []
  }
  parentBlock.children.push(newBlock)

  // Trigger update
  emit('update:blocks', [...props.blocks])
  emit('saveState')
}

// Render children blocks recursively (for Container)
const renderChildren = (parentBlock: Block) => {
  if (!parentBlock.children || parentBlock.children.length === 0) {
    return null
  }

  const BlockRendererComponent = instance?.type

  if (!BlockRendererComponent) {
    console.error('Cannot render children: component instance not found')
    return null
  }

  return h(BlockRendererComponent as any, {
    blocks: parentBlock.children,
    selectedId: props.selectedId,
    isPreview: props.isPreview,
    'onUpdate:blocks': (newChildren: Block[]) => {
      parentBlock.children = newChildren
      emit('update:blocks', [...props.blocks])
      emit('saveState')
    },
    onSelect: (id: string) => emit('select', id),
    onUpdate: (id: string, updates: Partial<Block>) => emit('update', id, updates),
    onDelete: (id: string) => emit('delete', id),
    onDuplicate: (id: string) => emit('duplicate', id),
    onMoveUp: (id: string) => emit('moveUp', id),
    onMoveDown: (id: string) => emit('moveDown', id),
    onSaveState: () => emit('saveState')
  })
}

// Render grid column with drop zone - ВСЕГДА рендерим, даже если пусто
const renderGridColumn = (gridBlock: Block, columnIndex: number) => {
  const BlockRendererComponent = instance?.type

  if (!BlockRendererComponent) {
    return null
  }

  // Получаем блоки для этой колонки
  const columnData = gridBlock.props.columnData || {}
  const columnBlocks = columnData[columnIndex] || []

  // ВАЖНО: Рендерим BlockRenderer ВСЕГДА, даже если пусто
  // Это позволяет перетаскивать блоки между колонками
  return h(BlockRendererComponent as any, {
    blocks: columnBlocks,  // Может быть пустым массивом - это ок!
    selectedId: props.selectedId,
    isPreview: props.isPreview,
    'onUpdate:blocks': (newBlocks: Block[]) => {
      if (!gridBlock.props.columnData) {
        gridBlock.props.columnData = {}
      }
      gridBlock.props.columnData[columnIndex] = newBlocks
      emit('update:blocks', [...props.blocks])
      emit('saveState')
    },
    onSelect: (id: string) => emit('select', id),
    onUpdate: (id: string, updates: Partial<Block>) => emit('update', id, updates),
    onDelete: (id: string) => emit('delete', id),
    onDuplicate: (id: string) => emit('duplicate', id),
    onMoveUp: (id: string) => emit('moveUp', id),
    onMoveDown: (id: string) => emit('moveDown', id),
    onSaveState: () => emit('saveState')
  })
}

// Handle drop into specific grid column
const onDropInGridColumn = (event: DragEvent, gridBlock: Block, columnIndex: number) => {
  event.stopPropagation()
  event.preventDefault()

  if (!event.dataTransfer) return

  const blockType = event.dataTransfer.getData('blockType')
  if (!blockType) return

  const blockDef = availableBlocks.find(b => b.type === blockType)
  if (!blockDef) return

  // Create new block
  const newBlock: Block = {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: blockType,
    props: { ...blockDef.defaultProps },
    customClasses: '',
    htmlId: '',
    children: blockDef.allowChildren ? [] : undefined
  }

  // Add to specific column
  if (!gridBlock.props.columnData) {
    gridBlock.props.columnData = {}
  }
  if (!gridBlock.props.columnData[columnIndex]) {
    gridBlock.props.columnData[columnIndex] = []
  }
  gridBlock.props.columnData[columnIndex].push(newBlock)

  // Trigger update
  emit('update:blocks', [...props.blocks])
  emit('saveState')
}
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
}
</style>