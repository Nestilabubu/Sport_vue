import axios from "axios";

const API_URL = "https://5c4f68a7b58c636d.mokky.dev";

// Рассчитать статистику из заказов
export async function calculateStatisticsFromOrders(userId) {
  try {
    // Получаем все заказы пользователя
    const { data: orders } = await axios.get(
      `${API_URL}/orders?user_id=${userId}`
    );

    if (orders.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        totalItems: 0,
        averageOrder: 0,
        favoriteCategory: "Нет данных",
        lastOrderDate: null,
        activityLevel: "Новичок",
      };
    }

    // Считаем статистику
    let totalSpent = 0;
    let totalItems = 0;
    const categories = {};

    orders.forEach((order) => {
      totalSpent += order.totalPrice;
      totalItems += order.items.length;

      order.items.forEach((item) => {
        if (item.category) {
          categories[item.category] = (categories[item.category] || 0) + 1;
        }
      });
    });

    // Находим любимую категорию
    let favoriteCategory = "Нет данных";
    if (Object.keys(categories).length > 0) {
      favoriteCategory = Object.entries(categories).sort(
        (a, b) => b[1] - a[1]
      )[0][0];
    }

    // Последний заказ
    const sortedOrders = orders.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const lastOrderDate = sortedOrders[0]?.createdAt;

    // Уровень активности
    const totalOrders = orders.length;
    const averageOrder = totalSpent / totalOrders;

    let activityLevel = "Новичок";
    if (totalOrders >= 10) activityLevel = "Постоянный клиент";
    else if (totalOrders >= 5) activityLevel = "Активный покупатель";
    else if (totalOrders >= 3) activityLevel = "Начинающий покупатель";
    else if (totalOrders >= 1) activityLevel = "Первый заказ";

    return {
      totalOrders,
      totalSpent,
      totalItems,
      averageOrder: Math.round(averageOrder),
      favoriteCategory,
      categoryCounts: categories,
      lastOrderDate,
      lastOrderAmount: sortedOrders[0]?.totalPrice,
      activityLevel,
      createdAt: sortedOrders[sortedOrders.length - 1]?.createdAt,
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Ошибка расчета статистики:", error);
    return {
      totalOrders: 0,
      totalSpent: 0,
      totalItems: 0,
      averageOrder: 0,
      favoriteCategory: "Нет данных",
      lastOrderDate: null,
      activityLevel: "Новичок",
    };
  }
}

// Получить статистику (аналоги предыдущим функциям)
export async function getExtendedStatistics(userId) {
  return await calculateStatisticsFromOrders(userId);
}

// Для совместимости с остальным кодом
export async function getUserStatistics(userId) {
  return await calculateStatisticsFromOrders(userId);
}

export async function updateOrderStatistics(userId, orderData) {
  // При использовании этого подхода статистика рассчитывается на лету из заказов
  // Поэтому просто возвращаем обновленную статистику
  return await calculateStatisticsFromOrders(userId);
}

export async function updateUserStatistics(userId, statsData) {
  // В этом подходе статистика не сохраняется отдельно
  return await calculateStatisticsFromOrders(userId);
}
