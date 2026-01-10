export const updateOrderStatistics = (userId, orderData) => {
  try {
    const savedStats = localStorage.getItem(`user_stats_${userId}`);
    let userStats = savedStats ? JSON.parse(savedStats) : null;

    if (!userStats) {
      userStats = {
        user_id: userId,
        totalOrders: 0,
        totalSpent: 0,
        averageOrder: 0,
        favoriteCategory: null,
        totalItemsBought: 0,
        totalUniqueItems: 0,
        categoryStats: {},
        lastUpdated: new Date().toISOString(),
      };
    }

    userStats.totalOrders += 1;
    userStats.totalSpent += orderData.totalPrice;
    userStats.averageOrder = userStats.totalSpent / userStats.totalOrders;

    const orderItemsCount = orderData.totalItems || 1;
    userStats.totalItemsBought += orderItemsCount;
    userStats.totalUniqueItems += orderData.items.length;

    const categoryCounts = {};

    orderData.items.forEach((item) => {
      const quantity = item.quantity || 1;

      if (item.category) {
        categoryCounts[item.category] =
          (categoryCounts[item.category] || 0) + quantity;

        if (!userStats.categoryStats) {
          userStats.categoryStats = {};
        }

        if (!userStats.categoryStats[item.category]) {
          userStats.categoryStats[item.category] = {
            count: 0,
            totalSpent: 0,
          };
        }

        userStats.categoryStats[item.category].count += quantity;
        userStats.categoryStats[item.category].totalSpent +=
          item.price * quantity;
      }
    });

    let favoriteCategory = null;
    let maxCount = 0;

    Object.entries(categoryCounts).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = category;
      }
    });

    userStats.favoriteCategory = favoriteCategory;
    userStats.lastUpdated = new Date().toISOString();

    localStorage.setItem(`user_stats_${userId}`, JSON.stringify(userStats));

    console.log("Статистика обновлена (localStorage):", userStats);
    return userStats;
  } catch (error) {
    console.error("Ошибка обновления статистики:", error);
    throw error;
  }
};

export const getStatistics = (userId) => {
  try {
    const savedStats = localStorage.getItem(`user_stats_${userId}`);
    return savedStats ? JSON.parse(savedStats) : null;
  } catch (error) {
    console.error("Ошибка получения статистики:", error);
    return null;
  }
};

export const resetStatistics = (userId) => {
  try {
    localStorage.removeItem(`user_stats_${userId}`);
    console.log("Статистика сброшена для пользователя:", userId);
  } catch (error) {
    console.error("Ошибка сброса статистики:", error);
  }
};
