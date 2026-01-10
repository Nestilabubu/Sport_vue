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
};

const removeFromCart = (item) => {
  const itemIndex = cart.value.findIndex(
    (cartItem) =>
      cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
  );

  if (itemIndex !== -1) {
    cart.value.splice(itemIndex, 1);
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

const isItemInCart = (itemId, selectedSize) => {
  return cart.value.some(
    (cartItem) =>
      cartItem.id === itemId && cartItem.selectedSize === selectedSize
  );
};

const getItemQuantity = (itemId, selectedSize) => {
  const item = cart.value.find(
    (cartItem) =>
      cartItem.id === itemId && cartItem.selectedSize === selectedSize
  );
  return item ? item.quantity || 1 : 0;
};

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

const addToFavorite = (item) => {
  const user = getCurrentUser();
  if (!user) {
    alert("Пожалуйста, войдите в систему, чтобы добавлять товары в избранное");
    return;
  }

  const favoritesKey = `favorites_${user.id}`;
  const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey) || "[]");

  if (!savedFavorites.some((fav) => fav.id === item.id)) {
    savedFavorites.push({
      id: item.id,
      title: item.title,
      price: item.price,
      imageUrl: item.imageUrl || item.imgUrl,
      category: item.category,
    });
    localStorage.setItem(favoritesKey, JSON.stringify(savedFavorites));
  }
};

const removeFromFavorite = (itemId) => {
  const user = getCurrentUser();
  if (!user) return;

  const favoritesKey = `favorites_${user.id}`;
  const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
  const updatedFavorites = savedFavorites.filter((fav) => fav.id !== itemId);
  localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
};

const isItemFavorite = (itemId) => {
  const user = getCurrentUser();
  if (!user) return false;

  const favoritesKey = `favorites_${user.id}`;
  const savedFavorites = JSON.parse(localStorage.getItem(favoritesKey) || "[]");
  return savedFavorites.some((fav) => fav.id === itemId);
};

const toggleFavorite = (item) => {
  const user = getCurrentUser();
  if (!user) {
    alert("Пожалуйста, войдите в систему, чтобы добавлять товары в избранное");
    return;
  }

  if (isItemFavorite(item.id)) {
    removeFromFavorite(item.id);
  } else {
    addToFavorite(item);
  }
};

const getFavorites = () => {
  const user = getCurrentUser();
  if (!user) return [];

  const favoritesKey = `favorites_${user.id}`;
  return JSON.parse(localStorage.getItem(favoritesKey) || "[]");
};

const logout = () => {
  localStorage.removeItem("current_user");
  localStorage.removeItem("user");
};

watch(
  cart,
  () => {
    localStorage.setItem("cart", JSON.stringify(cart.value));
  },
  { deep: true }
);

provide("cart", {
  cart,
  closeDrawer,
  openDrawer,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  isItemInCart,
  getItemQuantity,
});

provide("favorites", {
  addToFavorite,
  removeFromFavorite,
  isItemFavorite,
  toggleFavorite,
  getFavorites,
});

provide("auth", {
  logout,
  getCurrentUser,
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
