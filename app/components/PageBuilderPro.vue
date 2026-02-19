<!-- components/PageBuilderPro.vue -->
<template>
  <div class="page-builder h-screen flex flex-col bg-gray-50">
    <!-- Toolbar -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <h1 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h1>

        <!-- Auto-save indicator -->
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
          <button
              @click="activeTab = 'history'"
              :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              activeTab === 'history'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
            ]"
          >
            📜 История
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
          ↶ Отменить
        </button>
        <button
            @click="redo"
            :disabled="!canRedo"
            class="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Вернуть (Ctrl+Y)"
        >
          ↷ Вернуть
        </button>
        <button
            @click="togglePreview"
            class="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-medium text-sm transition-colors"
        >
          {{ isPreview ? '✏️ Редактировать' : '👁️ Превью' }}
        </button>
        <button
            @click="exportJSON"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
        >
          💾 JSON
        </button>
        <button
            @click="exportHTML"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium text-sm transition-colors"
        >
          🌐 HTML
        </button>
        <button
            @click="showImportModal = true"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
        >
          📥 Импорт
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
              class="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded cursor-move transition-colors group"
          >
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ block.icon }}</span>
              <div class="flex-1">
                <div class="font-medium text-sm text-gray-800">{{ block.name }}</div>
                <div class="text-xs text-gray-500">{{ block.description }}</div>
              </div>
            </div>
          </div>

          <!-- Custom Blocks Section -->
          <div v-if="customBlocks.length > 0" class="pt-4 mt-4 border-t border-gray-200">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">Пользовательские блоки</h2>
            <div
                v-for="block in customBlocks"
                :key="block.type"
                @dragstart="onDragStart($event, block)"
                draggable="true"
                class="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded cursor-move transition-colors"
            >
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ block.icon }}</span>
                <div class="flex-1">
                  <div class="font-medium text-sm text-purple-800">{{ block.name }}</div>
                  <div class="text-xs text-purple-600">{{ block.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-if="activeTab === 'settings'" class="p-4">
          <div v-if="selectedBlock">
            <h2 class="text-sm font-semibold text-gray-700 mb-3">Настройки блока</h2>

            <div class="space-y-4">
              <!-- Heading Settings -->
              <div v-if="selectedBlock.type === 'heading'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Уровень</label>
                <select
                    v-model="selectedBlock.props.level"
                    @change="saveState"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="h1">H1 - Главный заголовок</option>
                  <option value="h2">H2 - Подзаголовок</option>
                  <option value="h3">H3 - Секция</option>
                  <option value="h4">H4 - Подсекция</option>
                  <option value="h5">H5 - Мелкий заголовок</option>
                  <option value="h6">H6 - Минимальный</option>
                </select>
              </div>

              <!-- Button Settings -->
              <div v-if="selectedBlock.type === 'button'">
                <label class="block text-sm font-medium text-gray-700 mb-1">Вариант</label>
                <select
                    v-model="selectedBlock.props.variant"
                    @change="saveState"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="primary">Primary - Основная</option>
                  <option value="secondary">Secondary - Вторичная</option>
                  <option value="outline">Outline - Контурная</option>
                  <option value="ghost">Ghost - Призрачная</option>
                </select>

                <label class="block text-sm font-medium text-gray-700 mb-1 mt-3">Ссылка</label>
                <input
                    v-model="selectedBlock.props.href"
                    @input="saveState"
                    type="text"
                    placeholder="https://example.com"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Image Settings -->
              <div v-if="selectedBlock.type === 'image'">
                <label class="block text-sm font-medium text-gray-700 mb-1">URL изображения</label>
                <input
                    v-model="selectedBlock.props.src"
                    @input="saveState"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <label class="block text-sm font-medium text-gray-700 mb-1 mt-3">Alt текст</label>
                <input
                    v-model="selectedBlock.props.alt"
                    @input="saveState"
                    type="text"
                    placeholder="Описание изображения"
                    class="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

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
                <p class="text-xs text-gray-500 mt-1">Tailwind классы через пробел</p>
              </div>

              <div class="pt-3">
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
            <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            <p>Выберите блок</p>
            <p class="text-xs mt-1">для редактирования настроек</p>
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="activeTab === 'history'" class="p-4">
          <h2 class="text-sm font-semibold text-gray-700 mb-3">История изменений</h2>
          <div class="space-y-2">
            <div
                v-for="(state, index) in history.slice().reverse()"
                :key="index"
                class="p-2 bg-gray-50 rounded text-xs"
            >
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Версия {{ history.length - index }}</span>
                <button
                    @click="restoreFromHistory(history.length - index - 1)"
                    class="text-blue-600 hover:text-blue-700"
                >
                  Восстановить
                </button>
              </div>
              <div class="text-gray-500 mt-1">
                {{ state.blocks.length }} блоков
              </div>
            </div>
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
            @drop="!isPreview && onDrop($event)"
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
          <draggable
              v-else
              v-model="blocks"
              :animation="200"
              :disabled="isPreview"
              handle=".drag-handle"
              ghost-class="ghost"
              class="space-y-4"
              @change="saveState"
          >
            <template #item="{ element }">
              <div
                  :key="element.id"
                  @click="!isPreview && selectBlock(element)"
                  :class="[
                  'group relative transition-all',
                  !isPreview && selectedBlock?.id === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : '',
                  !isPreview ? 'hover:ring-2 hover:ring-gray-300' : ''
                ]"
              >
                <!-- Block Controls -->
                <div
                    v-if="!isPreview"
                    class="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10"
                >
                  <button class="drag-handle px-2 py-1 bg-gray-800 text-white text-xs rounded cursor-move hover:bg-gray-700">
                    ⋮⋮ Переместить
                  </button>
                  <button
                      @click.stop="duplicateBlock(element)"
                      class="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
                      title="Дублировать"
                  >
                    📋
                  </button>
                  <button
                      @click.stop="moveBlockUp(element.id)"
                      class="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
                      title="Вверх"
                  >
                    ↑
                  </button>
                  <button
                      @click.stop="moveBlockDown(element.id)"
                      class="px-2 py-1 bg-gray-800 text-white text-xs rounded hover:bg-gray-700"
                      title="Вниз"
                  >
                    ↓
                  </button>
                </div>

                <!-- Block Content -->
                <component
                    :is="getBlockComponent(element)"
                    v-bind="{ ...element.props, isPreview }"
                    :id="element.htmlId"
                    :class="element.customClasses"
                    @update:content="(val) => updateBlockContent(element, val)"
                />
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <div
        v-if="showImportModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="showImportModal = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 class="text-xl font-semibold mb-4">Импорт JSON</h2>
        <textarea
            v-model="importData"
            class="w-full h-64 px-3 py-2 border border-gray-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Вставьте JSON структуру блоков..."
        ></textarea>
        <div class="flex justify-end gap-2 mt-4">
          <button
              @click="showImportModal = false"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition-colors"
          >
            Отмена
          </button>
          <button
              @click="importJSON"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            Импортировать
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, h, watch, onMounted, onUnmounted } from 'vue'
import draggable from 'vuedraggable'

// Props
const props = defineProps({
  initialBlocks: {
    type: Array,
    default: () => []
  },
  pageTitle: {
    type: String,
    default: 'Page Builder Pro'
  },
  autoSave: {
    type: Boolean,
    default: true
  },
  autoSaveInterval: {
    type: Number,
    default: 5000 // 5 seconds
  }
})

// Emits
const emit = defineEmits(['save', 'change'])

// State
const blocks = ref([...props.initialBlocks])
const selectedBlock = ref(null)
const activeTab = ref('blocks')
const showImportModal = ref(false)
const importData = ref('')
const isPreview = ref(false)
const isSaving = ref(false)
const lastSaved = ref(null)

// History management
const history = ref([])
const historyIndex = ref(-1)
const maxHistorySize = 50

// Available blocks
const availableBlocks = [
  {
    type: 'heading',
    name: 'Заголовок',
    description: 'H1-H6 заголовки',
    icon: '📝',
    defaultProps: { content: 'Заголовок', level: 'h2' }
  },
  {
    type: 'text',
    name: 'Текст',
    description: 'Параграф текста',
    icon: '📄',
    defaultProps: { content: 'Введите текст здесь...' }
  },
  {
    type: 'button',
    name: 'Кнопка',
    description: 'Кнопка действия',
    icon: '🔘',
    defaultProps: { content: 'Нажмите', variant: 'primary', href: '' }
  },
  {
    type: 'image',
    name: 'Изображение',
    description: 'Блок изображения',
    icon: '🖼️',
    defaultProps: { src: 'https://placehold.co/800x400', alt: 'Placeholder image' }
  },
  {
    type: 'container',
    name: 'Контейнер',
    description: 'Flex контейнер',
    icon: '📦',
    defaultProps: { gap: '4', direction: 'row' }
  },
  {
    type: 'columns',
    name: 'Колонки',
    description: 'Grid колонки',
    icon: '⬜⬜',
    defaultProps: { columns: 2 }
  },
  {
    type: 'divider',
    name: 'Разделитель',
    description: 'Горизонтальная линия',
    icon: '➖',
    defaultProps: { style: 'solid' }
  },
  {
    type: 'spacer',
    name: 'Отступ',
    description: 'Пустое пространство',
    icon: '⬜',
    defaultProps: { height: '4' }
  }
]

// Custom blocks (can be loaded from user preferences)
const customBlocks = ref([])

// Computed
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// Block components
const getBlockComponent = (block) => {
  const components = {
    heading: (props) => h(
        props.level || 'h2',
        {
          class: 'font-bold mb-4 ' + getHeadingSize(props.level),
          contenteditable: !props.isPreview,
          suppressContentEditableWarning: true,
          onBlur: (e) => !props.isPreview && props['onUpdate:content']?.(e.target.innerText)
        },
        props.content
    ),
    text: (props) => h(
        'p',
        {
          class: 'text-gray-700 mb-4 leading-relaxed',
          contenteditable: !props.isPreview,
          suppressContentEditableWarning: true,
          onBlur: (e) => !props.isPreview && props['onUpdate:content']?.(e.target.innerText)
        },
        props.content
    ),
    button: (props) => {
      const button = h(
          props.href ? 'a' : 'button',
          {
            class: getButtonClasses(props.variant),
            contenteditable: !props.isPreview,
            suppressContentEditableWarning: true,
            href: props.href || undefined,
            onBlur: (e) => !props.isPreview && props['onUpdate:content']?.(e.target.innerText)
          },
          props.content
      )
      return button
    },
    image: (props) => h('img', {
      src: props.src,
      alt: props.alt,
      class: 'w-full h-auto rounded-lg mb-4 object-cover'
    }),
    container: (props) => h(
        'div',
        {
          class: `flex ${props.direction === 'column' ? 'flex-col' : 'flex-row'} gap-${props.gap} mb-4 p-4 ${!props.isPreview ? 'border-2 border-dashed border-gray-300 rounded min-h-[100px]' : ''}`
        },
        props.isPreview ? null : 'Flex Container'
    ),
    columns: (props) => h(
        'div',
        {
          class: `grid grid-cols-${props.columns} gap-4 mb-4`
        },
        Array.from({ length: props.columns }).map((_, i) =>
            h('div', {
              class: `${!props.isPreview ? 'p-4 border-2 border-dashed border-gray-300 rounded min-h-[100px]' : ''}`
            }, props.isPreview ? null : `Колонка ${i + 1}`)
        )
    ),
    divider: (props) => h('hr', {
      class: `my-8 ${props.style === 'dashed' ? 'border-dashed' : 'border-solid'} border-gray-300`
    }),
    spacer: (props) => h('div', {
      class: `h-${props.height}`
    })
  }

  return components[block.type]
}

const getHeadingSize = (level) => {
  const sizes = {
    h1: 'text-5xl',
    h2: 'text-4xl',
    h3: 'text-3xl',
    h4: 'text-2xl',
    h5: 'text-xl',
    h6: 'text-lg'
  }
  return sizes[level] || sizes.h2
}

const getButtonClasses = (variant) => {
  const variants = {
    primary: 'px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-block',
    secondary: 'px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors inline-block',
    outline: 'px-6 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors inline-block',
    ghost: 'px-6 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors inline-block'
  }
  return variants[variant] || variants.primary
}

// State management
const saveState = () => {
  // Remove future history if we're not at the end
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }

  // Add new state
  history.value.push({
    blocks: JSON.parse(JSON.stringify(blocks.value)),
    timestamp: Date.now()
  })

  // Limit history size
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

const restoreFromHistory = (index) => {
  historyIndex.value = index
  blocks.value = JSON.parse(JSON.stringify(history.value[index].blocks))
  selectedBlock.value = null
}

// Block operations
const onDragStart = (event, block) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('blockType', block.type)
}

const onDrop = (event) => {
  const blockType = event.dataTransfer.getData('blockType')
  if (!blockType) return

  const blockTemplate = [...availableBlocks, ...customBlocks.value].find(b => b.type === blockType)
  if (!blockTemplate) return

  const newBlock = {
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: blockType,
    props: { ...blockTemplate.defaultProps },
    customClasses: '',
    htmlId: ''
  }

  blocks.value.push(newBlock)
  saveState()
}

const selectBlock = (block) => {
  selectedBlock.value = block
  activeTab.value = 'settings'
}

const updateBlockContent = (block, newContent) => {
  block.props.content = newContent
  saveState()
}

const duplicateBlock = (block) => {
  const newBlock = {
    ...JSON.parse(JSON.stringify(block)),
    id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  const index = blocks.value.findIndex(b => b.id === block.id)
  blocks.value.splice(index + 1, 0, newBlock)
  saveState()
}

const deleteBlock = (blockId) => {
  blocks.value = blocks.value.filter(b => b.id !== blockId)
  selectedBlock.value = null
  saveState()
}

const moveBlockUp = (blockId) => {
  const index = blocks.value.findIndex(b => b.id === blockId)
  if (index > 0) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index - 1]
    blocks.value[index - 1] = temp
    saveState()
  }
}

const moveBlockDown = (blockId) => {
  const index = blocks.value.findIndex(b => b.id === blockId)
  if (index < blocks.value.length - 1) {
    const temp = blocks.value[index]
    blocks.value[index] = blocks.value[index + 1]
    blocks.value[index + 1] = temp
    saveState()
  }
}

const togglePreview = () => {
  isPreview.value = !isPreview.value
  if (isPreview.value) {
    selectedBlock.value = null
  }
}

// Export/Import
const exportJSON = () => {
  const json = JSON.stringify(blocks.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `page-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const exportHTML = () => {
  let html = ''

  blocks.value.forEach(block => {
    html += generateBlockHTML(block)
  })

  // Trim whitespace
  html = html.trim()

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `page-${Date.now()}.html`
  a.click()
  URL.revokeObjectURL(url)
}

// Get HTML as string (for v-html or programmatic use)
const getHTML = () => {
  let html = ''
  blocks.value.forEach(block => {
    html += generateBlockHTML(block)
  })
  return html.trim()
}

const generateBlockHTML = (block) => {
  const customClass = block.customClasses ? ` ${block.customClasses}` : ''
  const idAttr = block.htmlId ? ` id="${block.htmlId}"` : ''

  switch (block.type) {
    case 'heading':
      return `<${block.props.level}${idAttr} class="font-bold mb-4 ${getHeadingSize(block.props.level)}${customClass}">${block.props.content}</${block.props.level}>\n`
    case 'text':
      return `<p${idAttr} class="text-gray-700 mb-4 leading-relaxed${customClass}">${block.props.content}</p>\n`
    case 'button':
      const tag = block.props.href ? 'a' : 'button'
      const href = block.props.href ? ` href="${block.props.href}"` : ''
      return `<${tag}${idAttr}${href} class="${getButtonClasses(block.props.variant)}${customClass}">${block.props.content}</${tag}>\n`
    case 'image':
      return `<img${idAttr} src="${block.props.src}" alt="${block.props.alt}" class="w-full h-auto rounded-lg mb-4 object-cover${customClass}" />\n`
    case 'divider':
      return `<hr${idAttr} class="my-8 ${block.props.style === 'dashed' ? 'border-dashed' : 'border-solid'} border-gray-300${customClass}" />\n`
    case 'spacer':
      return `<div${idAttr} class="h-${block.props.height}${customClass}"></div>\n`
    default:
      return ''
  }
}

const importJSON = () => {
  try {
    const parsed = JSON.parse(importData.value)
    if (Array.isArray(parsed)) {
      blocks.value = parsed
      showImportModal.value = false
      importData.value = ''
      saveState()
    } else {
      alert('Неверный формат JSON. Ожидается массив блоков.')
    }
  } catch (error) {
    alert('Ошибка парсинга JSON: ' + error.message)
  }
}

// Auto-save
let autoSaveTimer = null

const triggerAutoSave = async () => {
  if (!props.autoSave) return

  isSaving.value = true
  try {
    await emit('save', blocks.value)
    lastSaved.value = new Date()
  } catch (error) {
    console.error('Auto-save error:', error)
  } finally {
    isSaving.value = false
  }
}

// Watch for changes
watch(blocks, () => {
  if (props.autoSave && autoSaveTimer) {
    clearTimeout(autoSaveTimer)
    autoSaveTimer = setTimeout(triggerAutoSave, props.autoSaveInterval)
  }
}, { deep: true })

// Keyboard shortcuts
const handleKeyboard = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault()
    undo()
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault()
    redo()
  } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    triggerAutoSave()
  }
}

// Utility
const formatTime = (date) => {
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин. назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч. назад`
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  // Initialize history
  saveState()

  // Add keyboard listener
  window.addEventListener('keydown', handleKeyboard)

  // Auto-save setup
  if (props.autoSave) {
    autoSaveTimer = setTimeout(triggerAutoSave, props.autoSaveInterval)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboard)
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
})

// Expose methods for parent components
defineExpose({
  getHTML,
  getJSON: () => JSON.stringify(blocks.value, null, 2),
  loadJSON: (json) => {
    try {
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed)) {
        blocks.value = parsed
        saveState()
        return true
      }
      return false
    } catch {
      return false
    }
  },
  getBlocks: () => blocks.value,
  setBlocks: (newBlocks) => {
    blocks.value = newBlocks
    saveState()
  }
})
</script>

<style scoped>
.ghost {
  opacity: 0.5;
  background: #f3f4f6;
  border: 2px dashed #9ca3af;
}

[contenteditable]:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

[contenteditable]:hover:not(:focus) {
  outline: 1px dashed #9ca3af;
  outline-offset: 2px;
  border-radius: 4px;
}
</style>