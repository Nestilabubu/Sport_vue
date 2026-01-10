<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getStatistics } from "../utils/statistics";

const router = useRouter();

const user = ref(null);
const statistics = ref({});
const orders = ref([]);
const isLoading = ref(true);
const activeTab = ref("profile");

const getCurrentUser = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("current_user") || "null"
  );
  if (currentUser) return currentUser;

  const oldUser = JSON.parse(localStorage.getItem("user") || "null");
  if (oldUser) {
    localStorage.setItem("current_user", JSON.stringify(oldUser));
    return oldUser;
  }

  return null;
};

const loadUserData = async () => {
  try {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    user.value = currentUser;

    const userStats = getStatistics(currentUser.id);

    if (userStats) {
      statistics.value = userStats;
    } else {
      statistics.value = {
        totalOrders: 0,
        totalSpent: 0,
        averageOrder: 0,
        favoriteCategory: null,
        totalItemsBought: 0,
        totalUniqueItems: 0,
        categoryStats: {},
      };
    }

    const savedOrders = localStorage.getItem(`user_orders_${currentUser.id}`);
    orders.value = savedOrders ? JSON.parse(savedOrders) : [];
  } catch (error) {
    console.error("Ошибка загрузки данных профиля:", error);
    statistics.value = {
      totalOrders: 0,
      totalSpent: 0,
      averageOrder: 0,
      favoriteCategory: null,
      totalItemsBought: 0,
      totalUniqueItems: 0,
      categoryStats: {},
    };
    orders.value = [];
  } finally {
    isLoading.value = false;
  }
};

const calculateCategoryStats = () => {
  if (!statistics.value.categoryStats) return [];

  return Object.entries(statistics.value.categoryStats)
    .map(([category, data]) => ({
      category,
      count: data.count || 0,
      totalSpent: data.totalSpent || 0,
      percentage:
        statistics.value.totalSpent > 0
          ? Math.round((data.totalSpent / statistics.value.totalSpent) * 100)
          : 0,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
};

const logout = () => {
  localStorage.removeItem("current_user");
  localStorage.removeItem("user");
  localStorage.removeItem("cart");
  localStorage.removeItem("selectedSizes");
  router.push("/");
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getOrderStatus = (createdAt) => {
  const orderDate = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

  if (diffDays < 1)
    return {
      text: "Новый",
      classes: "bg-green-100 text-green-800",
    };
  if (diffDays < 3)
    return {
      text: "В обработке",
      classes: "bg-blue-100 text-blue-800",
    };
  if (diffDays < 7)
    return {
      text: "Доставляется",
      classes: "bg-yellow-100 text-yellow-800",
    };
  return {
    text: "Завершен",
    classes: "bg-gray-100 text-gray-800",
  };
};

const getTabClasses = (tab) => {
  const baseClasses =
    "py-4 px-1 font-medium text-sm border-b-2 transition-all duration-200";

  if (activeTab.value === tab) {
    return `${baseClasses} border-blue-500 text-blue-600`;
  } else {
    return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
  }
};

onMounted(() => {
  loadUserData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4 max-w-7xl">
      <!-- Заголовок профиля -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <span class="text-2xl text-blue-600 font-bold">
                {{ user?.fullName?.[0] || "U" }}
              </span>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-800">
                {{ user?.fullName || "Пользователь" }}
              </h1>
              <p class="text-gray-600">Добро пожаловать в ваш профиль</p>
            </div>
          </div>
          <button
            @click="logout"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Выйти
          </button>
        </div>
      </div>

      <!-- Табы навигации -->
      <div class="mb-8 border-b border-gray-200">
        <nav class="flex space-x-8">
          <button
            @click="activeTab = 'profile'"
            :class="getTabClasses('profile')"
          >
            Профиль
          </button>
          <button
            @click="activeTab = 'statistics'"
            :class="getTabClasses('statistics')"
          >
            Статистика
          </button>
          <button
            @click="activeTab = 'orders'"
            :class="getTabClasses('orders')"
          >
            Мои заказы
          </button>
        </nav>
      </div>

      <!-- Загрузка -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Контент профиля -->
      <div v-else>
        <!-- Вкладка профиля -->
        <div
          v-if="activeTab === 'profile'"
          class="bg-white rounded-xl p-6 shadow"
        >
          <h2 class="text-xl font-bold mb-6">Личная информация</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Полное имя
              </label>
              <div
                class="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {{ user?.fullName || "Не указано" }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div
                class="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {{ user?.email || "Не указано" }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Адрес доставки
              </label>
              <div
                class="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {{ user?.address || "Не указан" }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Дата регистрации
              </label>
              <div
                class="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                {{
                  user?.createdAt ? formatDate(user.createdAt) : "Неизвестно"
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- Вкладка статистики -->
        <div v-if="activeTab === 'statistics'" class="space-y-6">
          <!-- Основная статистика -->
          <div class="bg-white rounded-xl p-6 shadow">
            <h3 class="text-xl font-bold mb-4">Статистика заказов</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="bg-blue-50 p-4 rounded-lg">
                <p class="text-sm text-blue-600">Всего заказов</p>
                <p class="text-2xl font-bold">
                  {{ statistics.totalOrders || 0 }}
                </p>
              </div>
              <div class="bg-green-50 p-4 rounded-lg">
                <p class="text-sm text-green-600">Всего потрачено</p>
                <p class="text-2xl font-bold">
                  {{ (statistics.totalSpent || 0).toLocaleString("ru-RU") }}
                  руб.
                </p>
              </div>
              <div class="bg-purple-50 p-4 rounded-lg">
                <p class="text-sm text-purple-600">Средний чек</p>
                <p class="text-2xl font-bold">
                  {{
                    Math.round(statistics.averageOrder || 0).toLocaleString(
                      "ru-RU"
                    )
                  }}
                  руб.
                </p>
              </div>
              <div class="bg-orange-50 p-4 rounded-lg">
                <p class="text-sm text-orange-600">Товаров куплено</p>
                <p class="text-2xl font-bold">
                  {{ statistics.totalItemsBought || 0 }}
                </p>
              </div>
            </div>

            <!-- Дополнительная информация -->
            <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-600">Уникальных позиций</p>
                <p class="text-xl font-bold">
                  {{ statistics.totalUniqueItems || 0 }}
                </p>
              </div>
              <div class="bg-pink-50 p-4 rounded-lg">
                <p class="text-sm text-pink-600">Любимая категория</p>
                <p class="text-xl font-bold">
                  {{ statistics.favoriteCategory || "Нет данных" }}
                </p>
              </div>
              <div class="bg-indigo-50 p-4 rounded-lg">
                <p class="text-sm text-indigo-600">Среднее на заказ</p>
                <p class="text-xl font-bold">
                  {{
                    statistics.totalOrders > 0
                      ? Math.round(
                          statistics.totalItemsBought / statistics.totalOrders
                        )
                      : 0
                  }}
                  шт.
                </p>
              </div>
            </div>
          </div>

          <!-- Статистика по категориям -->
          <div
            v-if="
              statistics.categoryStats &&
              Object.keys(statistics.categoryStats).length > 0
            "
            class="bg-white rounded-xl p-6 shadow"
          >
            <h3 class="text-xl font-bold mb-4">Статистика по категориям</h3>
            <div class="space-y-4">
              <div
                v-for="catStat in calculateCategoryStats()"
                :key="catStat.category"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">{{ catStat.category }}</span>
                  <span class="font-bold">{{ catStat.count }} шт.</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span
                    >Потрачено:
                    {{ catStat.totalSpent.toLocaleString("ru-RU") }} руб.</span
                  >
                  <span>{{ catStat.percentage }}% от общей суммы</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-blue-500 h-2 rounded-full"
                    :style="{ width: catStat.percentage + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Вкладка заказов -->
        <div v-if="activeTab === 'orders'" class="space-y-6">
          <div
            v-if="orders.length === 0"
            class="bg-white rounded-xl p-8 shadow text-center"
          >
            <div class="text-5xl mb-4">📦</div>
            <h3 class="text-xl font-bold mb-2">Заказов пока нет</h3>
            <p class="text-gray-600 mb-4">
              Совершите свой первый заказ, и он появится здесь
            </p>
            <router-link
              to="/"
              class="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              Перейти к покупкам
            </router-link>
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="order in orders"
              :key="order.id"
              class="bg-white rounded-xl p-6 shadow"
            >
              <!-- Заголовок заказа -->
              <div class="flex justify-between items-center mb-4">
                <div>
                  <h3 class="text-lg font-bold">Заказ #{{ order.id }}</h3>
                  <p class="text-gray-600 text-sm">
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <div class="flex items-center gap-3">
                  <span
                    class="px-3 py-1 text-xs font-medium rounded-full"
                    :class="getOrderStatus(order.createdAt).classes"
                  >
                    {{ getOrderStatus(order.createdAt).text }}
                  </span>
                  <span class="text-lg font-bold"
                    >{{
                      order.totalPrice?.toLocaleString("ru-RU") || 0
                    }}
                    руб.</span
                  >
                </div>
              </div>

              <!-- Товары в заказе -->
              <div class="border border-gray-200 rounded-lg mb-4">
                <div
                  v-for="(item, index) in order.items"
                  :key="index"
                  class="flex items-center gap-4 p-4 border-b border-gray-200 last:border-b-0"
                >
                  <img
                    :src="item.imageUrl"
                    :alt="item.title"
                    class="w-16 h-16 object-cover rounded-lg"
                  />
                  <div class="flex-1">
                    <h4 class="font-medium">{{ item.title }}</h4>
                    <div class="flex items-center gap-3 text-sm text-gray-600">
                      <span>Размер: {{ item.selectedSize }}</span>
                      <span>Количество: {{ item.quantity || 1 }}</span>
                      <span
                        >Цена:
                        {{ item.price?.toLocaleString("ru-RU") || 0 }}
                        руб.</span
                      >
                    </div>
                    <div class="mt-1">
                      <span class="font-bold">
                        Итого:
                        {{
                          (
                            (item.price || 0) * (item.quantity || 1)
                          ).toLocaleString("ru-RU")
                        }}
                        руб.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Итого по заказу -->
              <div
                class="flex justify-between items-center pt-4 border-t border-gray-200"
              >
                <div class="text-gray-600">
                  <p>
                    Товаров: {{ order.totalItems || order.items?.length || 0 }}
                  </p>
                  <p>
                    Адрес доставки:
                    {{ order.address || user?.address || "Не указан" }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Итого к оплате:</p>
                  <p class="text-xl font-bold">
                    {{ order.totalPrice?.toLocaleString("ru-RU") || 0 }} руб.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Используем встроенные стили для кастомных классов */
:root {
  --color-blue-500: #3b82f6;
  --color-blue-600: #2563eb;
  --color-gray-500: #6b7280;
  --color-gray-700: #374151;
  --color-gray-300: #d1d5db;
}

/* Стили для контейнера */
.container {
  max-width: 1200px;
}
</style>
