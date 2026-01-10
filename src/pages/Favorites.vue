<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getUserFavorites, removeFromFavorites } from "../utils/favorites";
import CardList from "../components/CardList.vue";

const router = useRouter();

const favorites = ref([]);
const isLoading = ref(true);

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("current_user") || "null");
};

const loadFavorites = () => {
  const user = getCurrentUser();

  if (!user) {
    router.push("/login");
    return;
  }

  const userFavorites = getUserFavorites(user.id);

  favorites.value = userFavorites.map((item) => ({
    ...item,
    isFavorite: true,
    isAdded: false,
    availableSizes: item.sizes ? item.sizes.split(",") : [],
  }));

  isLoading.value = false;
};

const removeFavorite = (item) => {
  const user = getCurrentUser();
  if (user) {
    favorites.value = removeFromFavorites(user.id, item.id);
  }
};

onMounted(() => {
  loadFavorites();
});


</script>

<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-gray-800">Мои закладки</h1>
      <p class="text-gray-600 mt-2">
        Товары, которые вы сохранили для покупки позже
      </p>
    </div>

    <div v-if="isLoading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
      ></div>
      <p class="mt-4 text-gray-600">Загрузка закладок...</p>
    </div>

    <div v-else-if="!favorites.length" class="text-center py-12">
      <div class="text-4xl mb-4">⭐</div>
      <h3 class="text-xl font-semibold mb-2">Закладок пока нет</h3>
      <p class="text-gray-600 mb-6">
        Добавляйте понравившиеся товары в закладки
      </p>
      <router-link
        to="/"
        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Перейти к покупкам
      </router-link>
    </div>

    <div v-else>
      <CardList
        :items="favorites"
        is-favorites
        @add-to-favorite="removeFavorite"
      />
    </div>
  </div>
</template>
