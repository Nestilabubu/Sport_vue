<script setup>
import { inject, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();

const props = defineProps({
  totalPrice: Number,
  vatPrice: Number,
});

const { cart, closeDrawer, removeFromCart } = inject("cart");

const isCreatingOrder = ref(false);

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("current_user") || "null");
};

const createOrder = async () => {
  try {
    isCreatingOrder.value = true;

    const user = getCurrentUser();

    if (!user) {
      alert("Пожалуйста, войдите в систему для оформления заказа");
      closeDrawer();
      router.push("/login");
      return;
    }

    const orderData = {
      user_id: user.id,
      items: cart.value.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl,
        selectedSize: item.selectedSize,
        category: item.category,
        color: item.color,
      })),
      totalPrice: props.totalPrice,
      address: user.address || "Не указан",
      createdAt: new Date().toISOString(),
    };

    await axios.post("https://5c4f68a7b58c636d.mokky.dev/orders", orderData);

    cart.value.forEach((item) => {
      item.isAdded = false;
    });
    cart.value = [];
    localStorage.removeItem("cart");

    alert("Заказ успешно оформлен! Проверьте историю в профиле.");
    closeDrawer();
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    alert("Произошла ошибка при оформлении заказа");
  } finally {
    isCreatingOrder.value = false;
  }
};
</script>

<template>
  <div
    class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"
    @click="closeDrawer"
  ></div>

  <div class="fixed top-0 right-0 h-full w-96 bg-white z-20 p-8 flex flex-col">
    <div class="flex items-center justify-between mb-10">
      <h2 class="text-2xl font-bold">Корзина</h2>
      <button
        @click="closeDrawer"
        class="flex items-center gap-2 text-gray-400 hover:text-black transition"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <span class="text-sm">Закрыть</span>
      </button>
    </div>

    <div
      v-if="cart.length === 0"
      class="flex-1 flex flex-col items-center justify-center"
    >
      <div class="text-5xl mb-4">🛒</div>
      <h3 class="text-xl font-semibold mb-2">Корзина пуста</h3>
      <p class="text-gray-500 text-center mb-6">
        Добавьте хотя бы один товар, чтобы сделать заказ
      </p>
      <button
        @click="closeDrawer"
        class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Продолжить покупки
      </button>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div class="space-y-4">
        <div
          v-for="item in cart"
          :key="item.id + item.selectedSize"
          class="flex items-center gap-4 border border-gray-200 rounded-xl p-4"
        >
          <img
            :src="item.imageUrl"
            :alt="item.title"
            class="w-20 h-20 object-cover rounded-lg"
          />

          <div class="flex-1">
            <h4 class="font-medium mb-1">{{ item.title }}</h4>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span>Размер: {{ item.selectedSize }}</span>
              <span>Цвет: {{ item.color || "Не указан" }}</span>
            </div>
            <div class="flex items-center justify-between mt-2">
              <span class="font-bold"
                >{{ item.price.toLocaleString("ru-RU") }} руб.</span
              >
              <button
                @click="removeFromCart(item)"
                class="text-red-500 hover:text-red-700 transition"
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200">
        <div class="space-y-3">
          <div class="flex justify-between text-gray-600">
            <span>Товары ({{ cart.length }})</span>
            <span>{{ totalPrice.toLocaleString("ru-RU") }} руб.</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>НДС 5%</span>
            <span>{{ vatPrice.toLocaleString("ru-RU") }} руб.</span>
          </div>
          <div
            class="flex justify-between text-xl font-bold pt-3 border-t border-gray-200"
          >
            <span>Итого</span>
            <span
              >{{ (totalPrice + vatPrice).toLocaleString("ru-RU") }} руб.</span
            >
          </div>
        </div>
      </div>
    </div>

    <div v-if="cart.length > 0" class="mt-8">
      <button
        @click="createOrder"
        :disabled="isCreatingOrder"
        class="w-full py-4 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <svg
          v-if="isCreatingOrder"
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span v-if="isCreatingOrder">Оформление...</span>
        <span v-else>Оформить заказ →</span>
      </button>
      <p class="text-xs text-gray-500 text-center mt-2">
        Заказ будет сохранен в вашем профиле
      </p>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
