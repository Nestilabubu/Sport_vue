<script setup>
import { computed, ref, inject } from "vue";
import axios from "axios";
import CartItemList from "./CartItemList.vue";
import DrawerHeader from "./DrawerHeader.vue";
import InfoBlock from "./InfoBlock.vue";

const props = defineProps({
  totalPrice: Number,
  vatPrice: Number,
});

const { cart } = inject("cart");

const isCreating = ref(false);
const orderID = ref(null);

const buttonDisabled = computed(() => isCreating.value || cartIsEmpty.value);

const cartIsEmpty = computed(() => cart.value.length === 0);

const createOrder = async () => {
  try {
    isCreating.value = true;
    const { data } = await axios.post(
      "https://5c4f68a7b58c636d.mokky.dev/orders",
      {
        items: cart.value,
        totalPrice: props.totalPrice,
      }
    );
    cart.value = [];
    orderID.value = data.id;
    return data;
  } catch (e) {
    console.log(e);
  } finally {
    isCreating.value = false;
  }
};
</script>

<template>
  <div class="fixed top-0 left-0 h-full w-full bg-black z-10 opacity-70"></div>

  <div class="bg-white w-96 h-full fixed right-0 top-0 z-20 p-8 flex flex-col">
    <DrawerHeader />

    <div v-if="!totalPrice || orderID" class="flex h-full items-center">
      <InfoBlock
        v-if="!totalPrice && !orderID"
        title="Корзина пустая"
        description="Добавьте хотя бы один спортивный костюм, чтобы сделать заказ."
        image-url="/package-icon.png"
      />

      <InfoBlock
        v-if="orderID"
        title="Заказ оформлен"
        :description="`Ваш заказ #${orderID} скоро будет передан курьерской доставке`"
        image-url="/order-success-icon.png"
      />
    </div>

    <div v-else class="flex flex-col flex-1 overflow-hidden">
      <div class="flex-1 overflow-y-auto pr-2">
        <CartItemList />
      </div>

      <div class="flex flex-col gap-4 mt-7 flex-shrink-0">
        <div class="flex gap-2 items-center">
          <span class="text-gray-600">Итого:</span>
          <div class="flex-1 border-b border-dashed border-gray-300"></div>
          <span class="font-bold text-lg">{{ totalPrice }} руб.</span>
        </div>

        <div class="flex gap-2 items-center">
          <span class="text-gray-600">Налог 5%:</span>
          <div class="flex-1 border-b border-dashed border-gray-300"></div>
          <span class="font-bold text-lg">{{ vatPrice }} руб.</span>
        </div>

        <button
          :disabled="buttonDisabled"
          @click="createOrder"
          class="mt-7 transition bg-lime-500 w-full rounded-xl py-3 text-white disabled:bg-slate-300 cursor-pointer hover:bg-lime-600 active:bg-lime-700 font-medium"
        >
          Оформить заказ
        </button>
      </div>
    </div>
  </div>
</template>
