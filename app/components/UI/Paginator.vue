<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  total: number
  page: number
  perPage: number
}

const props = defineProps<Props>()
const emit = defineEmits(['update:page'])

const totalPages = computed(() => Math.ceil(props.total / props.perPage))

function setPage(p: number) {
  if (p >= 1 && p <= totalPages.value) emit('update:page', p)
}

const pagesToShow = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = props.page

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) pages.push(i)

    if (current < total - 2) pages.push('...')
    pages.push(total)
  }

  return pages
})
</script>

<template>
  <div class="flex items-center justify-center gap-2 select-none">
    <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-100 transition"
        :class="{ 'opacity-50 pointer-events-none': page === 1 }"
        @click="setPage(page - 1)"
    >
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.2436 9.05989C5.32085 8.98279 5.38214 8.89122 5.42396 8.79041C5.46578 8.68959 5.4873 8.58153 5.4873 8.47239C5.4873 8.36325 5.46578 8.25518 5.42396 8.15437C5.38214 8.05355 5.32085 7.96198 5.2436 7.88489L2.01027 4.65155L5.2436 1.41822C5.32075 1.34107 5.38195 1.24948 5.42371 1.14867C5.46546 1.04787 5.48695 0.939829 5.48695 0.83072C5.48695 0.721611 5.46546 0.61357 5.42371 0.512767C5.38195 0.411963 5.32075 0.32037 5.2436 0.243218C5.16645 0.166067 5.07486 0.104868 4.97405 0.0631142C4.87325 0.0213595 4.76521 -0.00013059 4.6561 -0.000130581C4.54699 -0.000130571 4.43895 0.0213595 4.33815 0.0631143C4.23734 0.104868 4.14575 0.166067 4.0686 0.243219L0.2436 4.06822C0.166347 4.14531 0.105057 4.23689 0.0632396 4.3377C0.021422 4.43851 -0.000103413 4.54658 -0.000103403 4.65572C-0.000103394 4.76486 0.021422 4.87293 0.0632397 4.97374C0.105057 5.07455 0.166347 5.16612 0.2436 5.24322L4.0686 9.06822C4.38527 9.38489 4.9186 9.38489 5.2436 9.05989Z" fill="#8D95A5"/>
      </svg>

      Назад
    </button>

    <div class="flex gap-2">
      <template v-for="(p, index) in pagesToShow" :key="index">
        <button
            v-if="p !== '...'"
            @click="setPage(p as number)"
            class="px-4 py-2 rounded-xl border transition"
            :class="p === page ? 'bg-gray-200 font-semibold' : 'bg-white hover:bg-gray-100'"
        >
          {{ p }}
        </button>
        <span v-else class="px-3 text-gray-500">...</span>
      </template>
    </div>

    <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-100 transition"
        :class="{ 'opacity-50 pointer-events-none': page === totalPages }"
        @click="setPage(page + 1)"
    >
      Далее
      <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.243704 0.244802C0.166451 0.321897 0.105161 0.413471 0.0633431 0.514282C0.0215252 0.615093 0 0.723161 0 0.832302C0 0.941442 0.0215252 1.04951 0.0633431 1.15032C0.105161 1.25113 0.166451 1.34271 0.243704 1.4198L3.47704 4.65313L0.243704 7.88647C0.166552 7.96362 0.105352 8.05521 0.0635982 8.15602C0.021844 8.25682 0.00035286 8.36486 0.00035286 8.47397C0.000352859 8.58308 0.021844 8.69112 0.0635982 8.79192C0.105352 8.89272 0.166552 8.98432 0.243704 9.06147C0.320855 9.13862 0.412447 9.19982 0.513251 9.24157C0.614054 9.28333 0.722095 9.30482 0.831204 9.30482C0.940312 9.30482 1.04835 9.28333 1.14916 9.24157C1.24996 9.19982 1.34155 9.13862 1.4187 9.06147L5.2437 5.23647C5.32096 5.15937 5.38225 5.0678 5.42406 4.96699C5.46588 4.86618 5.48741 4.75811 5.48741 4.64897C5.48741 4.53983 5.46588 4.43176 5.42406 4.33095C5.38225 4.23014 5.32096 4.13856 5.2437 4.06147L1.4187 0.236468C1.10204 -0.0801983 0.568704 -0.0801981 0.243704 0.244802Z" fill="#8D95A5"/>
      </svg>

    </button>
  </div>
</template>
