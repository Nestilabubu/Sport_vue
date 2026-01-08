<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const user = ref(null);
const orders = ref([]);
const isLoading = ref(true);
const activeTab = ref("profile");

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("current_user") || "null");
};

const stats = computed(() => {
  const totalSpent = orders.value.reduce(
    (sum, order) => sum + order.totalPrice,
    0
  );
  const totalItems = orders.value.reduce(
    (sum, order) => sum + order.items.length,
    0
  );
  const averageOrder =
    orders.value.length > 0 ? totalSpent / orders.value.length : 0;

  return {
    totalOrders: orders.value.length,
    totalSpent,
    totalItems,
    averageOrder: Math.round(averageOrder),
    favoriteCategory: getFavoriteCategory(),
  };
});

function getFavoriteCategory() {
  if (orders.value.length === 0) return "Нет данных";

  const categories = {};
  orders.value.forEach((order) => {
    order.items.forEach((item) => {
      categories[item.category] = (categories[item.category] || 0) + 1;
    });
  });

  const mostPopular = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  return mostPopular ? mostPopular[0] : "Нет данных";
}

const fetchOrders = async () => {
  try {
    if (!user.value) return;

    const { data } = await axios.get(
      "https://5c4f68a7b58c636d.mokky.dev/orders"
    );

    const userOrders = data.filter((order) => order.user_id === user.value.id);

    orders.value = userOrders.map((order) => ({
      ...order,
      dateFormatted: new Date(order.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));
  } catch (error) {
    console.error("Ошибка загрузки заказов:", error);
  }
};

const loadUserData = () => {
  user.value = getCurrentUser();
  if (!user.value) {
    router.push("/login");
  }
};

const logout = () => {
  localStorage.removeItem("current_user");
  router.push("/");
};

const deleteAccount = async () => {
  if (
    !confirm(
      "Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить."
    )
  ) {
    return;
  }

  try {
    if (user.value?.id) {
      await axios.delete(
        `https://5c4f68a7b58c636d.mokky.dev/users/${user.value.id}`
      );
    }

    logout();
    alert("Аккаунт успешно удален");
  } catch (error) {
    console.error("Ошибка удаления аккаунта:", error);
    alert("Произошла ошибка при удалении аккаунта");
  }
};

onMounted(async () => {
  loadUserData();
  if (user.value) {
    await fetchOrders();
  }
  isLoading.value = false;
});
</script>

<template>
  <div v-if="isLoading" class="text-center py-12">
    <div
      class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
    ></div>
    <p class="mt-4 text-gray-600">Загрузка профиля...</p>
  </div>

  <div v-else-if="!user" class="text-center py-12">
    <div class="text-4xl mb-4">🔒</div>
    <h3 class="text-xl font-semibold mb-2">Доступ запрещен</h3>
    <p class="text-gray-600 mb-6">Пожалуйста, войдите в систему</p>
    <router-link
      to="/login"
      class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
    >
      Войти
    </router-link>
  </div>

  <div v-else class="max-w-6xl mx-auto">
    <div
      class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div
            class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold"
          >
            {{ user.fullName?.[0] || "U" }}
          </div>
          <div>
            <h1 class="text-3xl font-bold mb-2">{{ user.fullName }}</h1>
            <p class="text-blue-100">{{ user.email }}</p>
            <p v-if="user.phone" class="text-blue-100">{{ user.phone }}</p>
            <p class="text-blue-100 text-sm mt-2">
              Зарегистрирован:
              {{ new Date(user.createdAt).toLocaleDateString("ru-RU") }}
            </p>
          </div>
        </div>
        <button
          @click="logout"
          class="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
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

    <div class="flex border-b border-gray-200 mb-8">
      <button
        @click="activeTab = 'profile'"
        :class="[
          'px-6 py-3 font-medium border-b-2 transition',
          activeTab === 'profile'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700',
        ]"
      >
        Профиль
      </button>
      <button
        @click="activeTab = 'orders'"
        :class="[
          'px-6 py-3 font-medium border-b-2 transition',
          activeTab === 'orders'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700',
        ]"
      >
        Заказы ({{ orders.length }})
      </button>
      <button
        @click="activeTab = 'stats'"
        :class="[
          'px-6 py-3 font-medium border-b-2 transition',
          activeTab === 'stats'
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700',
        ]"
      >
        Статистика
      </button>
    </div>

    <div v-if="activeTab === 'profile'" class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Всего заказов</p>
              <p class="text-2xl font-bold">{{ stats.totalOrders }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center gap-4 mb-4">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Всего потрачено</p>
              <p class="text-2xl font-bold">
                {{ stats.totalSpent.toLocaleString("ru-RU") }} руб.
              </p>
            </div>
          </div>
        </div>

        <div
          class="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <h3 class="text-lg font-semibold mb-4">Личная информация</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm text-gray-600 mb-1">Имя</label>
              <p class="font-medium">{{ user.fullName }}</p>
            </div>
            <div>
              <label class="block text-sm text-gray-600 mb-1">Email</label>
              <p class="font-medium">{{ user.email }}</p>
            </div>
            <div v-if="user.phone">
              <label class="block text-sm text-gray-600 mb-1">Телефон</label>
              <p class="font-medium">{{ user.phone }}</p>
            </div>
            <div v-if="user.address">
              <label class="block text-sm text-gray-600 mb-1"
                >Адрес доставки</label
              >
              <p class="font-medium">{{ user.address }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-red-800 mb-2">Опасная зона</h3>
        <p class="text-red-600 mb-4">
          Удаление аккаунта невозможно отменить. Все ваши данные будут удалены.
        </p>
        <button
          @click="deleteAccount"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Удалить аккаунт
        </button>
      </div>
    </div>

    <div v-else-if="activeTab === 'orders'">
      <div v-if="orders.length === 0" class="text-center py-12">
        <div class="text-4xl mb-4">📦</div>
        <h3 class="text-xl font-semibold mb-2">Заказов пока нет</h3>
        <p class="text-gray-600 mb-6">Совершите свой первый заказ!</p>
        <router-link
          to="/"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Перейти к покупкам
        </router-link>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white border border-gray-200 rounded-xl overflow-hidden"
        >
          <div
            class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center"
          >
            <div>
              <p class="font-semibold">Заказ #{{ order.id }}</p>
              <p class="text-sm text-gray-600">{{ order.dateFormatted }}</p>
            </div>
            <div class="text-right">
              <p class="text-lg font-bold text-blue-600">
                {{ order.totalPrice.toLocaleString("ru-RU") }} руб.
              </p>
              <p class="text-sm text-gray-600">
                {{ order.items.length }} товар(ов)
              </p>
            </div>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <img
                  :src="item.imageUrl"
                  :alt="item.title"
                  class="w-16 h-16 object-cover rounded"
                />
                <div class="flex-1">
                  <h4 class="font-medium">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600">
                    Размер: {{ item.selectedSize }}, Цвет: {{ item.color }},
                    Категория: {{ item.category }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-bold">
                    {{ item.price.toLocaleString("ru-RU") }} руб.
                  </p>
                  <p class="text-sm text-gray-600">Кол-во: 1</p>
                </div>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-600">
                    Статус:
                    <span class="font-medium text-green-600">Доставлен</span>
                  </p>
                  <p v-if="order.address" class="text-sm text-gray-600 mt-1">
                    Адрес доставки: {{ order.address }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Итого к оплате:</p>
                  <p class="text-2xl font-bold text-blue-600">
                    {{ order.totalPrice.toLocaleString("ru-RU") }} руб.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'stats'">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Всего заказов</p>
              <p class="text-2xl font-bold">{{ stats.totalOrders }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Всего потрачено</p>
              <p class="text-2xl font-bold">
                {{ stats.totalSpent.toLocaleString("ru-RU") }} руб.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Всего товаров</p>
              <p class="text-2xl font-bold">{{ stats.totalItems }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"
            >
              <svg
                class="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <p class="text-sm text-gray-600">Средний чек</p>
              <p class="text-2xl font-bold">
                {{ stats.averageOrder.toLocaleString("ru-RU") }} руб.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 class="text-lg font-semibold mb-6">Аналитика покупок</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-gray-700 mb-3">Популярные категории</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Самая популярная:</span>
                <span class="font-semibold">{{ stats.favoriteCategory }}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 class="font-medium text-gray-700 mb-3">Активность</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Первый заказ:</span>
                <span class="font-semibold">
                  {{
                    orders.length > 0
                      ? orders[orders.length - 1]?.dateFormatted?.split(",")[0]
                      : "Нет заказов"
                  }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Последний заказ:</span>
                <span class="font-semibold">
                  {{
                    orders.length > 0
                      ? orders[0]?.dateFormatted?.split(",")[0]
                      : "Нет заказов"
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
