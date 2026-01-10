<script setup>
import { computed, provide, ref, watch } from "vue";
import Header from "./components/Header.vue";
import Drawer from "./components/Drawer.vue";

const cart = ref([]);
const drawerOpen = ref(false);

const savedCart = localStorage.getItem("cart");
if (savedCart) {
  cart.value = JSON.parse(savedCart);
}

const totalPrice = computed(() =>
  cart.value.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0)
);

const vatPrice = computed(() => Math.round((totalPrice.value * 5) / 100));

const closeDrawer = () => {
  drawerOpen.value = false;
};

const openDrawer = () => {
  drawerOpen.value = true;
};

const addToCart = (item) => {
  const existingItem = cart.value.find(
    (cartItem) =>
      cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
  );

  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    const itemWithSize = {
      ...item,
      selectedSize:
        item.selectedSize || item.size || item.availableSizes?.[0] || "M",
      quantity: 1,
    };
    cart.value.push(itemWithSize);
  }

  item.isAdded = true;
};

const removeFromCart = (item) => {
  const itemIndex = cart.value.findIndex(
    (cartItem) =>
      cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
  );

  if (itemIndex !== -1) {
    cart.value.splice(itemIndex, 1);
    item.isAdded = false;
  }
};

const updateCartQuantity = (item, newQuantity) => {
  const existingItem = cart.value.find(
    (cartItem) =>
      cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
  );

  if (existingItem) {
    if (newQuantity < 1) {
      removeFromCart(item);
    } else {
      existingItem.quantity = newQuantity;
    }
  }
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
  updateCartQuantity,
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
