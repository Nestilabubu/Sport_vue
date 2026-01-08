const LOCAL_USERS_KEY = "sportshop_local_users";
const CURRENT_USER_KEY = "current_user";

const initializeTestUsers = () => {
  const testUsers = [
    {
      id: 1,
      fullName: "Тестовый Пользователь",
      email: "test@mail.com",
      password: "123456",
      phone: "+7 (999) 999-99-99",
      address: "Тестовый адрес",
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(testUsers));

  return testUsers;
};

export function getAllUsers() {
  try {
    let users = JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || "[]");

    if (users.length === 0) {
      users = initializeTestUsers();
    }

    return users;
  } catch (error) {
    return initializeTestUsers();
  }
}

export function findUser(email, password) {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();

  const user = users.find((u) => {
    const userEmail = (u.email || "").toLowerCase().trim();
    return userEmail === normalizedEmail && u.password === password;
  });

  return user;
}

export function checkEmailExists(email) {
  const users = getAllUsers();
  const normalizedEmail = email.toLowerCase().trim();

  return users.some((u) => {
    const userEmail = (u.email || "").toLowerCase().trim();
    return userEmail === normalizedEmail;
  });
}

export function createUser(userData) {
  const users = getAllUsers();

  const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;

  const newUser = {
    ...userData,
    id: newId,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));

  return newUser;
}

export function setCurrentUser(user) {
  const userToStore = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    address: user.address,
    createdAt: user.createdAt,
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToStore));
}

export function getCurrentUser() {
  const user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || "null");
  return user;
}

export function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
