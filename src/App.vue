<script setup>
import { computed, provide, ref, watch } from "vue";
import Header from "./components/Header.vue";
import Drawer from "./components/Drawer.vue";

const cart = ref([]);
const drawerOpen = ref(false);

const totalPrice = computed(() =>
  cart.value.reduce((acc, item) => acc + item.price, 0)
);

const vatPrice = computed(() => Math.round((totalPrice.value * 5) / 100));

const closeDrawer = () => {
  drawerOpen.value = false;
};

const openDrawer = () => {
  drawerOpen.value = true;
};

const addToCart = (item) => {
  const itemWithSize = {
    ...item,
    selectedSize: item.size || item.availableSizes?.[0] || "M",
  };
  cart.value.push(itemWithSize);
  item.isAdded = true;
};

const removeFromCart = (item) => {
  cart.value.splice(cart.value.indexOf(item), 1);
  item.isAdded = false;
};

watch(
  cart,
  () => {
    localStorage.setItem("cart", JSON.stringify(cart.value));
  },
  {
    deep: true,
  }
);

provide("cart", {
  cart,
  closeDrawer,
  openDrawer,
  addToCart,
  removeFromCart,
});
</script>

<template>
  <Drawer v-if="drawerOpen" :total-price="totalPrice" :vat-price="vatPrice" />

  <div
    class="bg-white w-5/6 m-auto rounded-xl shadow-xl mt-10"
    :class="{ 'opacity-70': drawerOpen }"
  >
    <Header :total-price="totalPrice" @open-drawer="openDrawer" />
    <div class="p-10">
      <router-view></router-view>
    </div>
  </div>
</template>
