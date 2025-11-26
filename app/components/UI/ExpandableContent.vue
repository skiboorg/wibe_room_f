<template>
  <div class="expandable-content mb-2">
    <div
        ref="contentEl"
        class="content leading-[130%] overflow-hidden transition-all duration-300"
        :style="contentStyle"
        v-html="content"
    ></div>

    <!-- Градиент для плавного скрытия -->
    <div
        v-if="!isExpanded && isOverflowing"
        class="fade-overlay"
    ></div>

    <!-- Кнопка переключения -->
    <div
        v-if="showButton"
        class="text-primary cursor-pointer mt-2 hover:opacity-80 transition-opacity"
        @click="toggle"
    >
      {{ buttonText }}
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, nextTick} from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  maxHeight: {
    type: Number,
    default: 100
  },
  expandText: {
    type: String,
    default: 'Показать полностью...'
  },
  collapseText: {
    type: String,
    default: 'Свернуть'
  },
  showFade: {
    type: Boolean,
    default: true
  },
  animationDuration: {
    type: Number,
    default: 300
  },
  scrollToTopOnCollapse: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['toggle'])

const isExpanded = ref(false)
const isOverflowing = ref(false)
const contentEl = ref(null)
const actualHeight = ref(0)

// Проверяем, переполнен ли контент
const checkOverflow = async () => {
  await nextTick()
  if (contentEl.value) {
    const element = contentEl.value
    actualHeight.value = element.scrollHeight
    isOverflowing.value = actualHeight.value > props.maxHeight
  }
}

// Прокрутка к началу элемента
const scrollToTop = () => {
  if (contentEl.value) {
    // Прокручиваем родительский контейнер к началу контента
    contentEl.value.scrollIntoView({
      //behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    })

    // Альтернативный вариант - прокрутка самого элемента
    // contentEl.value.parentElement?.scrollTo({
    //   top: contentEl.value.offsetTop - 20, // с небольшим отступом
    //   behavior: 'smooth'
    // })
  }
}

// Переключение состояния
const toggle = async () => {
  const wasExpanded = isExpanded.value
  isExpanded.value = !isExpanded.value

  // Если сворачиваем и нужно прокрутить к началу
  if (wasExpanded && props.scrollToTopOnCollapse) {
    // Ждем начала анимации сворачивания
    await nextTick()
    // Даем небольшую задержку для начала анимации
    setTimeout(scrollToTop, 50)
  }

  emit('toggle', isExpanded.value)
}

// Стили для контента с правильной анимацией
const contentStyle = computed(() => ({
  maxHeight: isExpanded.value ? `${actualHeight.value}px` : `${props.maxHeight}px`,
  transition: `max-height ${props.animationDuration}ms ease-in-out`
}))

// Текст кнопки
const buttonText = computed(() =>
    isExpanded.value ? props.collapseText : props.expandText
)

// Показывать ли кнопку
const showButton = computed(() =>
    isOverflowing.value || isExpanded.value
)

// Инициализация
onMounted(() => {
  checkOverflow()
})

// Реактивность на изменение контента
defineExpose({
  checkOverflow,
  scrollToTop
})
</script>

<style scoped>
.fade-overlay {
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to top, white, transparent);
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.expandable-content {
  position: relative;
}

.content {
  word-wrap: break-word;
}

/* Плавная анимация для градиента */
.expandable-content:has(.content:hover) .fade-overlay {
  opacity: 0.8;
}
</style>