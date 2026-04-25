// Utility para gerenciar dados persistentes no localStorage
const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';
const PRODUCTS_KEY = 'allProducts';

const parseJson = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const normalizeEmail = (email) => email.trim().toLowerCase();

export const storage = {
  // USUÁRIOS
  getUsers: () => {
    return parseJson(localStorage.getItem(USERS_KEY), []);
  },

  saveUsers: (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  registerUser: (payload) => {
    const users = storage.getUsers();
    const email = normalizeEmail(payload.email);

    if (users.some((user) => normalizeEmail(user.email) === email)) {
      throw new Error('Este email já está cadastrado.');
    }

    const newUser = {
      id: Date.now(),
      name: payload.name,
      email,
      password: payload.password,
      phone: payload.phone || '',
      company: payload.company || 'Minha Loja',
      isSeller: true,
      registeredAt: new Date().toISOString(),
    };

    users.push(newUser);
    storage.saveUsers(users);
    storage.saveUser(newUser);
    return newUser;
  },

  authenticateUser: (email, password) => {
    const users = storage.getUsers();
    const normalized = normalizeEmail(email);
    const user = users.find(
      (candidate) =>
        normalizeEmail(candidate.email) === normalized && candidate.password === password
    );

    if (!user) {
      return null;
    }

    storage.saveUser(user);
    return user;
  },

  saveUser: (user) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  getCurrentUser: () => {
    return parseJson(localStorage.getItem(CURRENT_USER_KEY), null);
  },

  clearUser: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // PRODUTOS (persistem no navegador do usuário)
  getAllProducts: () => {
    return parseJson(localStorage.getItem(PRODUCTS_KEY), []);
  },

  addProduct: (product) => {
    const products = storage.getAllProducts();
    const newProduct = {
      ...product,
      id: Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return newProduct;
  },

  deleteProduct: (productId) => {
    const products = storage.getAllProducts();
    const filtered = products.filter((p) => p.id !== productId);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  },

  updateProduct: (productId, updatedData) => {
    const products = storage.getAllProducts();
    const index = products.findIndex((p) => p.id === productId);

    if (index === -1) {
      return null;
    }

    const updatedProduct = {
      ...products[index],
      ...updatedData,
      id: products[index].id,
      userId: products[index].userId,
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    return updatedProduct;
  },

  getProductsByUserId: (userId) => {
    const products = storage.getAllProducts();
    return products.filter((p) => p.userId === userId);
  },
};
