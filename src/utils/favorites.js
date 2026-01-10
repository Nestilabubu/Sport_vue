
export const addToFavorites = (userId, item) => {
  try {
    if (!userId) {
      console.error("User ID is required");
      return;
    }

    const favoritesKey = `favorites_${userId}`;
    const savedFavorites = JSON.parse(
      localStorage.getItem(favoritesKey) || "[]"
    );

    if (!savedFavorites.some((fav) => fav.id === item.id)) {
      const favoriteItem = {
        id: item.id,
        title: item.title,
        price: item.price,
        imageUrl: item.imageUrl || item.imgUrl,
        category: item.category,
        sizes:
          item.sizes ||
          (item.availableSizes ? item.availableSizes.join(",") : ""),
        addedAt: new Date().toISOString(),
      };

      savedFavorites.push(favoriteItem);
      localStorage.setItem(favoritesKey, JSON.stringify(savedFavorites));
      console.log(
        `Товар ${item.id} добавлен в избранное пользователя ${userId}`
      );
    }

    return savedFavorites;
  } catch (error) {
    console.error("Ошибка при добавлении в избранное:", error);
    return [];
  }
};

export const removeFromFavorites = (userId, itemId) => {
  try {
    if (!userId) {
      console.error("User ID is required");
      return [];
    }

    const favoritesKey = `favorites_${userId}`;
    const savedFavorites = JSON.parse(
      localStorage.getItem(favoritesKey) || "[]"
    );
    const updatedFavorites = savedFavorites.filter((fav) => fav.id !== itemId);

    localStorage.setItem(favoritesKey, JSON.stringify(updatedFavorites));
    console.log(`Товар ${itemId} удален из избранного пользователя ${userId}`);

    return updatedFavorites;
  } catch (error) {
    console.error("Ошибка при удалении из избранного:", error);
    return [];
  }
};

export const getUserFavorites = (userId) => {
  try {
    if (!userId) {
      console.error("User ID is required");
      return [];
    }

    const favoritesKey = `favorites_${userId}`;
    const savedFavorites = JSON.parse(
      localStorage.getItem(favoritesKey) || "[]"
    );

    return savedFavorites;
  } catch (error) {
    console.error("Ошибка при получении избранного:", error);
    return [];
  }
};

export const isItemInFavorites = (userId, itemId) => {
  try {
    if (!userId) return false;

    const favoritesKey = `favorites_${userId}`;
    const savedFavorites = JSON.parse(
      localStorage.getItem(favoritesKey) || "[]"
    );

    return savedFavorites.some((fav) => fav.id === itemId);
  } catch (error) {
    console.error("Ошибка при проверке избранного:", error);
    return false;
  }
};

export const getFavoritesCount = (userId) => {
  try {
    if (!userId) return 0;

    const favoritesKey = `favorites_${userId}`;
    const savedFavorites = JSON.parse(
      localStorage.getItem(favoritesKey) || "[]"
    );

    return savedFavorites.length;
  } catch (error) {
    console.error("Ошибка при получении количества избранного:", error);
    return 0;
  }
};

export const clearUserFavorites = (userId) => {
  try {
    if (!userId) return;

    const favoritesKey = `favorites_${userId}`;
    localStorage.removeItem(favoritesKey);
    console.log(`Избранное пользователя ${userId} очищено`);
  } catch (error) {
    console.error("Ошибка при очистке избранного:", error);
  }
};
