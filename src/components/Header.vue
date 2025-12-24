<script setup>
defineProps({
  totalPrice: Number,
});

const emit = defineEmits(["openDrawer"]);
</script>

<template>
  <header class="flex justify-between border-b border-slate-200 px-10 py-8">
    <router-link to="/">
      <div class="flex items-center cursor:pointer gap-4">
        <img src="/logo.png" alt="logo" class="w-20" />
        <div>
          <h2 class="text-xl font-bold uppercase">SportStyle</h2>
          <p class="text-slate-400">Магазин спортивных костюмов</p>
        </div>
      </div>
    </router-link>

    <ul class="flex items-center gap-10">
      <li
        @click="() => emit('openDrawer')"
        class="flex items-center cursor-pointer gap-3 text-gray-500 hover:text-black transition-colors"
      >
        <img src="/cart.svg" alt="Cart" class="filter brightness-90" />
        <b class="text-gray-500">{{ totalPrice }} руб.</b>
      </li>

      <router-link to="/favorites">
        <li
          class="flex items-center gap-3 text-gray-500 hover:text-black transition-colors"
        >
          <img src="/heart.svg" alt="Favorites" class="filter brightness-90" />
          <span>Закладки</span>
        </li>
      </router-link>
    </ul>
  </header>
</template>
