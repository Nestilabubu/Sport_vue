// Система закладок пользователей

const FAVORITES_KEY = "sportshop_user_favorites";

// Получить все закладки пользователя
export function getUserFavorites(userId) {
  try {
    const allFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "{}"
    );
    return allFavorites[userId] || [];
  } catch (error) {
    console.error("Ошибка получения закладок:", error);
    return [];
  }
}

// Добавить товар в закладки
export function addToFavorites(userId, item) {
  try {
    const allFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "{}"
    );
    const userFavorites = allFavorites[userId] || [];

    // Проверяем, нет ли уже такого товара
    if (!userFavorites.some((fav) => fav.id === item.id)) {
      userFavorites.push({
        ...item,
        addedAt: new Date().toISOString(),
      });

      allFavorites[userId] = userFavorites;
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
    }

    return userFavorites;
  } catch (error) {
    console.error("Ошибка добавления в закладки:", error);
    return [];
  }
}

// Удалить товар из закладок
export function removeFromFavorites(userId, itemId) {
  try {
    const allFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "{}"
    );
    const userFavorites = allFavorites[userId] || [];

    const updatedFavorites = userFavorites.filter((fav) => fav.id !== itemId);
    allFavorites[userId] = updatedFavorites;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));

    return updatedFavorites;
  } catch (error) {
    console.error("Ошибка удаления из закладок:", error);
    return [];
  }
}

// Проверить, есть ли товар в закладках
export function isItemInFavorites(userId, itemId) {
  try {
    const allFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "{}"
    );
    const userFavorites = allFavorites[userId] || [];
    return userFavorites.some((fav) => fav.id === itemId);
  } catch (error) {
    console.error("Ошибка проверки закладок:", error);
    return false;
  }
}

// Получить количество закладок пользователя
export function getFavoritesCount(userId) {
  try {
    const allFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "{}"
    );
    const userFavorites = allFavorites[userId] || [];
    return userFavorites.length;
  } catch (error) {
    console.error("Ошибка получения количества закладок:", error);
    return 0;
  }
}

// Очистить все закладки пользователя
export function clearUserFavorites(userId) {
  try {
    const allFavorites = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "{}"
    );
    delete allFavorites[userId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
    return true;
  } catch (error) {
    console.error("Ошибка очистки закладок:", error);
    return false;
  }
}
