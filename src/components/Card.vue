<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  id: Number,
  imgUrl: String,
  title: String,
  price: Number,
  isFavorite: Boolean,
  isAdded: Boolean,
  onClickAdd: Function,
  onClickFav: Function,
  category: String,
  availableSizes: Array,
  color: String,
});

const visibleFavoriteButton = Boolean(props.onClickFav);
const selectedSize = ref(props.availableSizes?.[0] || "");

watch(selectedSize, (newSize) => {
  if (props.id) {
    const savedSizes = JSON.parse(
      localStorage.getItem("selectedSizes") || "{}"
    );
    savedSizes[props.id] = newSize;
    localStorage.setItem("selectedSizes", JSON.stringify(savedSizes));
  }
});

const savedSizes = JSON.parse(localStorage.getItem("selectedSizes") || "{}");
if (
  props.id &&
  savedSizes[props.id] &&
  props.availableSizes.includes(savedSizes[props.id])
) {
  selectedSize.value = savedSizes[props.id];
}

const categoryColor = computed(() => {
  switch (props.category) {
    case "мужской":
      return "bg-blue-100 text-blue-800";
    case "женский":
      return "bg-pink-100 text-pink-800";
    case "детский":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
});
</script>

<template>
  <div
    class="relative bg-white border border-slate-100 rounded-3xl p-8 cursor-pointer transition hover:-translate-y-2 hover:shadow-xl"
  >
    <div class="absolute top-3 left-3 z-10">
      <span
        :class="['px-3 py-1 text-sm font-medium rounded-full', categoryColor]"
      >
        {{ category }}
      </span>
    </div>

    <img
      v-if="visibleFavoriteButton"
      @click="onClickFav"
      :src="!isFavorite ? '/like-1.svg' : '/like-2.svg'"
      alt="Добавить в избранное"
      class="absolute top-8 right-8 z-10 w-6 h-6 cursor-pointer hover:scale-110 transition"
    />

    <div
      class="rounded-2xl overflow-hidden mb-4 h-64 flex items-center justify-center bg-gray-100"
    >
      <img
        :src="imgUrl"
        :alt="title"
        class="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>

    <h3 class="mt-2 font-medium text-lg text-gray-800 line-clamp-2 h-14">
      {{ title }}
    </h3>

    <div class="mt-3">
      <p class="text-sm text-slate-500 mb-1">Размер:</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in availableSizes"
          :key="size"
          @click.stop="selectedSize = size"
          class="px-3 py-1 text-sm border rounded-md transition min-w-[40px]"
          :class="
            selectedSize === size
              ? 'border-blue-500 bg-blue-50 text-blue-600'
              : 'border-gray-200 hover:border-gray-300 text-gray-700'
          "
        >
          {{ size }}
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center mt-5 pt-4 border-t">
      <div class="flex flex-col">
        <span class="text-slate-400 text-sm">Цена:</span>
        <b class="text-xl text-gray-800">{{ price }} руб.</b>
      </div>
      <img
        v-if="onClickAdd"
        @click="onClickAdd({ ...$props, selectedSize })"
        :src="!isAdded ? '/plus.svg' : '/checked.svg'"
        alt="Добавить в корзину"
        class="w-8 h-8 cursor-pointer hover:scale-110 transition"
      />
    </div>
  </div>
</template>
