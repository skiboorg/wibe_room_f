<script setup lang="ts">
const {$api} = useNuxtApp()

const {data:events_response, refresh, status} = useHttpRequest(useAsyncData(()=>$api.community.events()))

// Текущий отображаемый индекс
const current_display_index = ref(0)

// Функция для получения русского названия месяца
const getRussianMonthName = (month: number) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]
  return months[month]
}

// Computed свойство для индекса текущего месяца
const current_events_group = computed(() => {
  if (!events_response.value) return -1

  const now = new Date()
  const currentMonth = getRussianMonthName(now.getMonth())
  const currentYear = now.getFullYear()
  const currentMonthKey = `${currentMonth} ${currentYear}`

  return events_response.value.findIndex((group: any) => group.month === currentMonthKey)
})

// Устанавливаем начальный индекс на текущий месяц
watch(events_response, (newData) => {
  if (newData && newData.length > 0) {
    if (current_events_group.value !== -1) {
      current_display_index.value = current_events_group.value
    } else {
      current_display_index.value = 0
    }
  }
}, { immediate: true })

// Функции для навигации
const nextMonth = () => {
  if (!events_response.value) return
  current_display_index.value = (current_display_index.value + 1) % events_response.value.length
}

const prevMonth = () => {
  if (!events_response.value) return
  current_display_index.value = (current_display_index.value - 1 + events_response.value.length) % events_response.value.length
}

// Текущая отображаемая группа
const currentGroup = computed(() => {
  if (!events_response.value || events_response.value.length === 0) return null
  return events_response.value[current_display_index.value]
})

// Для отладки
watch(current_display_index, (newIndex) => {
  console.log('Текущий отображаемый индекс:', newIndex)
  if (events_response.value && events_response.value[newIndex]) {
    console.log('Отображаемая группа:', events_response.value[newIndex])
  }
})
const hanldeDelete = async (slug) => {
  console.log(slug)
  await $api.community.event_delete(slug)
  await refresh()
}
</script>

<template>
  <div class="space-y-4">

    <Button label="Добавить" @click="navigateTo('events/new')"/>
    <!-- Навигация и отображение одной группы -->
    <div v-if="currentGroup">
      <CardBase padding="lg_sm" class="mb-2" >
        <div class="flex items-center justify-between">
          <!-- Кнопка назад -->
          <button
              @click="prevMonth"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              :disabled="!events_response || events_response.length <= 1"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="#F1F2F4"/>
              <path d="M23 26L17 20L23 14" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- Название месяца -->
          <p class="text-lg font-medium text-center flex-1 mx-4" :class="{'text-green-600': current_display_index === current_events_group}">
            {{ currentGroup.month }}
            <span v-if="current_display_index === current_events_group" class="text-xs ml-2">(текущий)</span>
          </p>

          <!-- Кнопка вперед -->
          <button
              @click="nextMonth"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors"
              :disabled="!events_response || events_response.length <= 1"
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="20" fill="#F1F2F4"/>
              <path d="M17 14L23 20L17 26" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </CardBase>

      <!-- Индикатор текущей позиции -->
      <div class="text-sm text-gray-500 text-center mb-2">
        {{ current_display_index + 1 }} из {{ events_response?.length || 0 }}
        <span v-if="current_display_index === current_events_group" class="text-green-600 ml-2">
        • Текущий месяц
      </span>
      </div>

      <!-- События текущей группы -->
      <div class="space-y-3">
        <CardEvent
            v-for="event in currentGroup.events"
            :key="event.id"
            :event="event"
            @delete-event="hanldeDelete"
        />

        <!-- Сообщение если нет событий -->
        <div v-if="currentGroup.events.length === 0" class="text-center py-8 text-gray-500">
          Нет событий в этом месяце
        </div>
      </div>
    </div>

    <!-- Сообщение если нет данных -->
    <div v-else-if="!events_response" class="text-center py-8 text-gray-500">
      Загрузка событий...
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      Нет доступных событий
    </div>
  </div>
</template>