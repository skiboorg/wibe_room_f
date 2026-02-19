<template>
  <div class="page-builder h-screen flex flex-col bg-gray-50">
    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h1>
        
        <!-- Save indicator -->
        <div class="flex items-center gap-2 text-sm">
          <span v-if="isSaving" class="flex items-center gap-1 text-gray-500">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Сохранение...
          </span>
          <span v-else-if="lastSaved" class="text-green-600">
            ✓ Сохранено {{ formatTime(lastSaved) }}
          </span>
        </div>

        <div class="flex gap-2">
          <button
            @click="activeTab = 'blocks'"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              activeTab === 'blocks'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            📦 Блоки
          </button>
          <button
            @click="activeTab = 'settings'"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              activeTab === 'settings'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            ⚙️ Настройки
          </button>
        </div>
      </div>
      
      <div class="flex gap-2">
        <button
          @click="undo"
          :disabled="!canUndo"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Отменить (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          @click="redo"
          :disabled="!canRedo"
          class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Вернуть (Ctrl+Y)"
        >
          ↷
        </button>
        <button
          @click="togglePreview"
          class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-medium text-sm transition-colors"
        >
          {{ isPreview ? '✏️ Редактировать' : '👁️ Превью' }}
        </button>
        <button
          @click="handleSave"
          :disabled="isSaving"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-50"
        >
          💾 Сохранить
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <!-- Blocks Tab -->
        <div v-if="activeTab === 'blocks'" class="p-4 space-y-2">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">Доступные блоки</h2>
          <div
            v-for="block in availableBlocks"
            :key="block.type"
            @dragstart="onDragStart($event, block)"
            draggable="true"
            class="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded cursor-move transition-colors"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ block.icon }}</span>
              <div class="flex-1">
                <div class="font-medium text-sm text-gray-800">{{ block.name }}</div>
                <div class="text-xs text-gray-500">{{ block.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="p-4">
          <div v-if="selectedBlock">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">Настройки блока</h2>
            
            <div class="space-y-4">
              <!-- Dynamic block-specific settings -->
              <template v-if="blockSettings">
                <div v-for="field in blockSettings.fields" :key="field.model">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
                  
                  <select
                    v-if="field.type === 'select'"
                    :value="getNestedValue(selectedBlock, field.model)"
                    @change="setNestedValue(selectedBlock, field.model, ($event.target as HTMLSelectElement).value); saveState()"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                  
                  <input
                    v-else-if="field.type === 'text'"
                    :value="getNestedValue(selectedBlock, field.model)"
                    @input="setNestedValue(selectedBlock, field.model, ($event.target as HTMLInputElement).value); saveState()"
                    type="text"
                    :placeholder="field.placeholder"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </template>

              <!-- Common Settings -->
              <div class="pt-3 border-t border-gray-200">
                <label class="block text-sm font-medium text-gray-700 mb-1">CSS классы</label>
                <input
                  v-model="selectedBlock.customClasses"
                  @input="saveState"
                  type="text"
                  placeholder="custom-class another-class"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ID элемента</label>
                <input
                  v-model="selectedBlock.htmlId"
                  @input="saveState"
                  type="text"
                  placeholder="my-element-id"
                  class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                @click="deleteBlock(selectedBlock.id)"
                class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium text-sm transition-colors mt-4"
              >
                🗑️ Удалить блок
              </button>
            </div>
          </div>

          <div v-else class="text-center text-gray-500 text-sm py-8">
            <p>Выберите блок для редактирования</p>
          </div>
        </div>
      </div>

      <!-- Canvas -->
      <div class="flex-1 overflow-y-auto p-8 bg-gray-100">
        <div
          :class="[
            'max-w-5xl mx-auto bg-white shadow-lg min-h-[600px] transition-all',
            isPreview ? 'p-0' : 'p-8'
          ]"
          @drop="onDrop"
          @dragover.prevent
          @dragenter.prevent
        >
          <!-- Empty State -->
          <div v-if="blocks.length === 0" class="text-center text-gray-400 py-20">
            <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="text-lg font-medium">Начните создание</p>
            <p class="text-sm mt-1">Перетащите блоки из панели слева</p>
          </div>

          <!-- Blocks -->
          <BlockRenderer
            v-else
            v-model="blocks"
            :selected-id="selectedBlock?.id"
            :is-preview="isPreview"
            @select="selectBlock"
            @update="updateBlock"
            @delete="deleteBlock"
            @duplicate="duplicateBlock"
            @move-up="moveBlockUp"
            @move-down="moveBlockDown"
            @save-state="saveState"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { getAllBlockDefinitions, getBlockSettings } from '../blocks'
import type { Block, SaveData } from '../types'
import BlockRenderer from './BlockRenderer.vue'

// Props
const props = defineProps<{
  initialData?: Block[]
  pageTitle?: string
  autoSave?: boolean
  autoSaveInterval?: number
}>()

// Emits
const emit = defineEmits<{
  save: [data: SaveData]
  change: [blocks: Block[]]
}>()

// State
const blocks = ref<Block[]>(props.initialData ? JSON.parse(JSON.stringify(props.initialData)) : [])
const selectedBlock = ref<Block | null>(null)
const activeTab = ref<'blocks' | 'settings'>('blocks')
const isPreview = ref(false)
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)

// History
const history = ref<{ blocks: Block[], timestamp: number }[]>([])
const historyIndex = ref(-1)
const maxHistorySize = 50

// Available blocks
const availableBlocks = getAllBlockDefinitions()

// Block settings
const blockSettings = computed(() => {
  if (!selectedBlock.value) return null
  const settingsFn = getBlockSettings(selectedBlock.value.type)
  return settingsFn ? settingsFn(selectedBlock.value, saveState) : null
})

// History navigation
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// Nested value helpers
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}

const setNestedValue = (obj: any, path: string, value: any) => {
  const parts = path.split('.')
  const last = parts.pop()!
  const target = parts.reduce((acc, part) => acc[part], obj)
  target[last] = value
}

// State management
const saveState = () => {
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  history.value.push({
    blocks: JSON.parse(JSON.stringify(blocks.value)),
    timestamp: Date.now()
  })

  if (history.value.length > maxHistorySize) {
    history.value.shift()
  } else {
    historyIndex.value++
  }

  emit('change', blocks.value)
}

const undo = () => {
  if (canUndo.value) {
    historyIndex.value--
    blocks.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].blocks))
    selectedBlock.value = null
  }
}

const redo = () => {
  if (canRedo.value) {
    historyIndex.value++
    blocks.value = JSON.parse(JSON.stringify(history.value[historyIndex.value].blocks))
    selectedBlock.value = null
  }
}

// Block operations
const findBlockById = (blockList: Block[], id: string): Block | null => {
  for (const block of blockList) {
    if (block.id === id) return block
    if (block.children) {
      const found = findBlockById(block.children, id)
      if (found) return found
    }
  }
  return null
}

const selectBlock = (id: string) => {
  selectedBlock.value = findBlockById(blocks.value, id)
  activeTab.value = 'settings'
}

const updateBlock = (id: string, updates: Partial<Block>) => {
  const block = findBlockById(blocks.value, id)
  if (block) {
    Object.assign(block, updates)
    saveState()
  }
}

const deleteBlock = (id: string) => {
  const removeFromList = (list: Block[]) => {
    const index = list.findIndex(b => b.id === id)
    if (index !== -1) {
      list.splice(index, 1)
      return true
    }
    for (const block of list) {
      if (block.children && removeFromList(block.children)) {
        return true
      }
    }
    return false
  }

  removeFromList(blocks.value)
  if (selectedBlock.value?.id === id) {
    selectedBlock.value = null
  }
  saveState()
}

const duplicateBlock = (id: string) => {
  const block = findBlockById(blocks.value, id)
  if (!block) return

  const clone = JSON.parse(JSON.stringify(block))
  clone.id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const regenerateIds = (b: Block) => {
    b.id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    if (b.children) {
      b.children.forEach(regenerateIds)
    }
  }
  if (clone.children) {
    clone.children.forEach(regenerateIds)
  }

  const findAndInsert = (list: Block[]): boolean => {
    const index = list.findIndex(b => b.id === id)
    if (index !== -1) {
      list.splice(index + 1, 0, clone)
      return true
    }
    for (const block of list) {
      if (block.children && findAndInsert(block.children)) {
        return true
      }
    }
    return false
  }

  findAndInsert(blocks.value)
  saveState()
}

const moveBlockUp = (id: string) => {
  const moveInList = (list: Block[]): boolean => {
    const index = list.findIndex(b => b.id === id)
    if (index > 0) {
      ;[list[index], list[index - 1]] = [list[index - 1], list[index]]
      return true
    }
    for (const block of list) {
      if (block.children && moveInList(block.children)) {
        return true
      }
    }
    return false
  }

  if (moveInList(blocks.value)) {
    saveState()
  }
}

const moveBlockDown = (id: string) => {
  const moveInList = (list: Block[]): boolean => {
    const index = list.findIndex(b => b.id === id)
    if (index !== -1 && index < list.length - 1) {
      ;[list[index], list[index + 1]] = [list[index + 1], list[index]]
      return true
    }
    for (const block of list) {
      if (block.children && moveInList(block.children)) {
        return true
      }
    }
    return false
  }

  if (moveInList(blocks.value)) {
    saveState()
  }
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
  if (isPreview.value) {
    selectedBlock.value = null
  }
}

// Drag and drop
const onDragStart = (event: DragEvent, block: any) => {
  if (!event.dataTransfer) return
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('blockType', block.type)
}

const onDrop = (event: DragEvent) => {
  if (!event.dataTransfer) return
  event.preventDefault()
  
  const blockType = event.dataTransfer.getData('blockType')
  if (!blockType) return

  const blockDef = availableBlocks.find(b => b.type === blockType)
  if (!blockDef) return

  const newBlock: Block = {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: blockType,
    props: { ...blockDef.defaultProps },
    customClasses: '',
    htmlId: '',
    children: blockDef.allowChildren ? [] : undefined
  }

  blocks.value.push(newBlock)
  saveState()
}

// Save handler
const handleSave = async () => {
  isSaving.value = true
  
  try {
    const { generateHTML } = await import('../composables/useHTMLGenerator')
    const html = generateHTML(blocks.value)
    const json = JSON.stringify(blocks.value, null, 2)
    
    const saveData: SaveData = {
      blocks: blocks.value,
      json,
      html
    }
    
    emit('save', saveData)
    lastSaved.value = new Date()
  } catch (error) {
    console.error('Save error:', error)
  } finally {
    isSaving.value = false
  }
}

// Keyboard shortcuts
const handleKeyboard = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    handleSave()
  }
}

// Utility
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`
  return date.toLocaleDateString()
}

// Watch for prop changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    blocks.value = JSON.parse(JSON.stringify(newData))
    saveState()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  saveState()
  window.addEventListener('keydown', handleKeyboard)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
})

// Expose methods
defineExpose({
  getBlocks: () => blocks.value,
  setBlocks: (newBlocks: Block[]) => {
    blocks.value = newBlocks
    saveState()
  }
})
</script>

<style scoped>
.page-builder {
  font-family: system-ui, -apple-system, sans-serif;
}
</style>
