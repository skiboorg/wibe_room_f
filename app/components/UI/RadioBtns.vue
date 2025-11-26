<script setup lang="ts">
import { ref, onMounted, watch } from "vue";

interface Item {
  name: string;
  slug: string;
  count?: number;
}

const props = defineProps<{
  items: Item[];
  show_sign:boolean
  modelValue?: string; // активный slug
}>();

const emit = defineEmits(["update:modelValue", "select"]);

const container = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

const checkScroll = () => {
  if (!container.value) return;

  canScrollLeft.value = container.value.scrollLeft > 10;
  canScrollRight.value =
      container.value.scrollWidth - container.value.clientWidth - container.value.scrollLeft > 10;
};

const scrollLeft = () => {
  container.value?.scrollBy({ left: -200, behavior: "smooth" });
};

const scrollRight = () => {
  container.value?.scrollBy({ left: 200, behavior: "smooth" });
};

onMounted(() => {
  checkScroll();
  container.value?.addEventListener("scroll", checkScroll);
});

watch(() => props.items, () => {
  setTimeout(checkScroll, 50);
});
watch(() => props.modelValue, () => {
  setTimeout(checkScroll, 50);
});

const selectItem = (slug: string) => {
  emit("update:modelValue", slug);
  emit("select", slug);
};
</script>

<template>
  <div class="relative w-full">

    <!-- Stripes gradient left -->
    <div
        v-if="canScrollLeft"
        class="absolute left-0 top-0 h-full w-10 pointer-events-none bg-gradient-to-r from-white via-white/80 to-transparent z-10"
    ></div>

    <!-- Stripes gradient right -->
    <div
        v-if="canScrollRight"
        class="absolute right-0 top-0 h-full w-10 pointer-events-none bg-gradient-to-l from-white via-white/80 to-transparent z-10"
    ></div>

    <!-- Left arrow -->
    <button
        v-if="canScrollLeft"
        @click="scrollLeft"
        class="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white shadow flex items-center justify-center"
    >
      ←
    </button>

    <!-- Right arrow -->
    <button
        v-if="canScrollRight"
        @click="scrollRight"
        class="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-7 w-7 rounded-full bg-white shadow flex items-center justify-center"
    >
      →
    </button>

    <!-- Scrollable row -->
    <div
        ref="container"
        class="flex gap-2 overflow-x-auto no-scrollbar py-2 pr-4"
    >
      <UIBadgeBtn
          v-for="item in items"
          :key="item.slug"
          :show_sign="show_sign"
          @click="selectItem(item.slug)"
          :is_active="props.modelValue === item.slug"
          :label=" item.name"
          :number="item.count"
      />
<!--      <button-->
<!--          v-for="item in items"-->
<!--          :key="item.slug"-->
<!--          @click="selectItem(item.slug)"-->
<!--          class="whitespace-nowrap px-4 py-1 rounded-xl border text-sm flex items-center gap-1"-->
<!--          :class="props.modelValue === item.slug-->
<!--          ? 'border-red-400 text-red-500 bg-red-50'-->
<!--          : 'border-gray-200 text-gray-700 bg-white'"-->
<!--      >-->
<!--        {{ item.label }}-->
<!--        <span-->
<!--            v-if="item.count"-->
<!--            class="opacity-70"-->
<!--        >{{ item.count }}</span>-->
<!--      </button>-->
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
