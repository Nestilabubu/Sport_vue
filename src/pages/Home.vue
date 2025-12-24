<script setup>
import axios from "axios";
import CardList from "../components/CardList.vue";
import { debounce } from "lodash";
import { inject, onMounted, reactive, ref, watch } from "vue";

const { addToCart, removeFromCart, cart } = inject("cart");

const items = ref([]);
const isLoading = ref(false);

const filters = reactive({
  sortBy: "title",
  searchQuery: "",
  category: "all",
  minPrice: "",
  maxPrice: "",
  size: "",
});

const categories = [
  { value: "all", label: "Все категории" },
  { value: "мужской", label: "Мужские" },
  { value: "женский", label: "Женские" },
  { value: "детский", label: "Детские" },
];

const sizes = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "110",
  "120",
  "130",
  "140",
  "150",
  "160",
];

const onChangeSelect = (e, filterType) => {
  filters[filterType] = e.target.value;
};

const onChangeSearchInput = debounce((e) => {
  filters.searchQuery = e.target.value;
}, 300);

const resetFilters = () => {
  filters.category = "all";
  filters.minPrice = "";
  filters.maxPrice = "";
  filters.size = "";
  filters.searchQuery = "";
  filters.sortBy = "title";
  fetchItems();
};

const addToFavorite = async (item) => {
  try {
    if (!item.isFavorite) {
      const obj = {
        item_id: item.id,
        selectedSize: item.selectedSize || item.availableSizes?.[0] || "",
      };

      const { data } = await axios.post(
        "https://5c4f68a7b58c636d.mokky.dev/favorites",
        obj
      );

      const itemIndex = items.value.findIndex((i) => i.id === item.id);
      if (itemIndex !== -1) {
        items.value[itemIndex].isFavorite = true;
        items.value[itemIndex].favoritesId = data.id;
      }
    } else {
      await axios.delete(
        `https://5c4f68a7b58c636d.mokky.dev/favorites/${item.favoritesId}`
      );

      const itemIndex = items.value.findIndex((i) => i.id === item.id);
      if (itemIndex !== -1) {
        items.value[itemIndex].isFavorite = false;
        items.value[itemIndex].favoritesId = null;
      }
    }
  } catch (e) {
    console.error("Ошибка при работе с избранным:", e);
    alert("Произошла ошибка. Пожалуйста, попробуйте снова.");
  }
};

const fetchItems = async () => {
  try {
    isLoading.value = true;

    const params = {
      sortBy: filters.sortBy,
    };

    if (filters.searchQuery) {
      params.title = `*${filters.searchQuery}*`;
    }

    if (filters.category !== "all") {
      params.category = filters.category;
    }

    if (filters.minPrice) {
      params.priceFrom = filters.minPrice;
    }

    if (filters.maxPrice) {
      params.priceTo = filters.maxPrice;
    }

    if (filters.size) {
      params.sizes = `*${filters.size}*`;
    }

    const { data } = await axios.get(
      "https://5c4f68a7b58c636d.mokky.dev/sportsuits",
      { params }
    );

    items.value = data.map((obj) => ({
      ...obj,
      isFavorite: false,
      favoritesId: null,
      isAdded: false,
      availableSizes: obj.sizes ? obj.sizes.split(",") : [],
    }));
  } catch (e) {
    console.error("Ошибка загрузки товаров с API:", e);

    const backupItems = [
      {
        id: 1,
        title: "Спортивный костюм мужской Adidas",
        price: 7999,
        imageUrl: "https://i.ebayimg.com/images/g/DRwAAOSw1q9l6c3m/s-l500.jpg",
        category: "мужской",
        sizes: "M,L,XL,XXL",
        color: "синий",
        material: "полиэстер",
        description: "Стильный спортивный костюм для активного отдыха",
      },
      {
        id: 2,
        title: "Спортивный костюм женский Nike",
        price: 6999,
        imageUrl:
          "https://i.pinimg.com/564x/a0/be/6b/a0be6bf9078e73990c0ed67e5b003b75.jpg",
        category: "женский",
        sizes: "XS,S,M,L",
        color: "розовый",
        material: "хлопок",
        description: "Удобный костюм для фитнеса и йоги",
      },
      {
        id: 3,
        title: "Детский спортивный костюм Puma",
        price: 3499,
        imageUrl:
          "https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_450,h_450/global/584859/01/fnd/EEA/fmt/png/Minicats-Crew-Babies'-Jogger",
        category: "детский",
        sizes: "110,120,130,140",
        color: "красный",
        material: "полиэстер",
        description: "Яркий костюм для активных детей",
      },
    ];

    let data = [...backupItems];

    if (filters.category !== "all") {
      data = data.filter((item) => item.category === filters.category);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          (item.description &&
            item.description.toLowerCase().includes(query)) ||
          (item.color && item.color.toLowerCase().includes(query))
      );
    }

    if (filters.minPrice) {
      data = data.filter((item) => item.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      data = data.filter((item) => item.price <= Number(filters.maxPrice));
    }

    if (filters.size) {
      data = data.filter((item) => item.sizes.includes(filters.size));
    }

    if (filters.sortBy === "price") {
      data.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === "-price") {
      data.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === "title") {
      data.sort((a, b) => a.title.localeCompare(b.title));
    }

    items.value = data.map((obj) => ({
      ...obj,
      isFavorite: false,
      favoritesId: null,
      isAdded: false,
      availableSizes: obj.sizes ? obj.sizes.split(",") : [],
    }));
  } finally {
    isLoading.value = false;
  }
};

const fetchFavorites = async () => {
  try {
    const { data: favorites } = await axios.get(
      "https://5c4f68a7b58c636d.mokky.dev/favorites"
    );

    items.value = items.value.map((item) => {
      const favorite = favorites.find(
        (favorite) => favorite.item_id === item.id
      );
      if (!favorite) {
        return item;
      }
      return {
        ...item,
        isFavorite: true,
        favoritesId: favorite.id,
      };
    });
  } catch (e) {
    console.log("Ошибка загрузки избранных товаров:", e);
  }
};

const onClickAddPlus = (item) => {
  if (!item.isAdded) {
    addToCart(item);
  } else {
    removeFromCart(item);
  }
};

onMounted(async () => {
  try {
    const localCart = localStorage.getItem("cart");
    cart.value = localCart ? JSON.parse(localCart) : [];

    await fetchItems();
    await fetchFavorites();

    items.value = items.value.map((item) => ({
      ...item,
      isAdded: cart.value.some((cartItem) => cartItem.id === item.id),
    }));
  } catch (error) {
    console.error("Ошибка инициализации:", error);
  }
});

watch(cart, () => {
  items.value = items.value.map((item) => ({
    ...item,
    isAdded: cart.value.some((cartItem) => cartItem.id === item.id),
  }));
});

watch(filters, fetchItems);
</script>

<template>
  <div class="mb-10">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold">Все спортивные костюмы</h2>
      <div class="flex items-center gap-4">
        <select
          @change="(e) => onChangeSelect(e, 'sortBy')"
          :value="filters.sortBy"
          class="py-2 px-3 border border-gray-200 focus:border-gray-400 rounded-md focus:outline-none"
        >
          <option value="title">По названию</option>
          <option value="price">По цене (дешевые)</option>
          <option value="-price">По цене (дорогие)</option>
          <option value="category">По категории</option>
        </select>
        <div class="relative">
          <input
            @input="onChangeSearchInput"
            :value="filters.searchQuery"
            type="text"
            class="border border-gray-200 rounded-md py-2 pl-10 pr-4 focus:outline-none focus:border-gray-400"
            placeholder="Поиск по названию..."
          />
          <div
            class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <img src="/search.svg" alt="Поиск" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 p-6 rounded-xl mb-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Фильтры</h3>
        <button
          @click="resetFilters"
          class="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Сбросить фильтры
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Категория
          </label>
          <select
            @change="(e) => onChangeSelect(e, 'category')"
            :value="filters.category"
            class="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option
              v-for="cat in categories"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Размер
          </label>
          <select
            @change="(e) => onChangeSelect(e, 'size')"
            :value="filters.size"
            class="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все размеры</option>
            <option v-for="size in sizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Цена от
          </label>
          <input
            @input="
              (e) => {
                filters.minPrice = e.target.value;
              }
            "
            @change="fetchItems"
            :value="filters.minPrice"
            type="number"
            min="0"
            placeholder="0"
            class="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Цена до
          </label>
          <input
            @input="
              (e) => {
                filters.maxPrice = e.target.value;
              }
            "
            @change="fetchItems"
            :value="filters.maxPrice"
            type="number"
            min="0"
            placeholder="20000"
            class="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  </div>

  <div v-if="isLoading" class="text-center py-12">
    <div
      class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
    ></div>
    <p class="mt-4 text-gray-600">Загрузка товаров...</p>
  </div>

  <div v-else-if="items.length === 0" class="text-center py-12">
    <div class="text-4xl mb-4">🛍️</div>
    <h3 class="text-xl font-semibold mb-2">Товары не найдены</h3>
    <p class="text-gray-600">Попробуйте изменить параметры фильтрации</p>
    <button
      @click="resetFilters"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
    >
      Сбросить фильтры
    </button>
  </div>

  <div v-else class="mt-10">
    <p class="text-gray-600 mb-4">Найдено {{ items.length }} товаров</p>
    <CardList
      :items="items"
      @add-to-favorite="addToFavorite"
      @add-to-cart="onClickAddPlus"
    />
  </div>
</template>
