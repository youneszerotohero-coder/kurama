const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Short-lived cache + de-duplication for public GET requests (cleared by any write)
const getCache = new Map();
const GET_TTL = 30_000;
export const clearApiCache = () => getCache.clear();

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = (options.method || 'GET').toUpperCase();
  const headers = getHeaders();

  // `cache` is our own flag: never hand it to fetch (where it means something else)
  const { cache: useCache, ...fetchOptions } = options;
  const config = {
    ...fetchOptions,
    headers: {
      ...headers,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const run = async () => {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  };

  if (method !== 'GET') {
    getCache.clear();
    return run();
  }
  if (!useCache) return run();

  const hit = getCache.get(url);
  if (hit && Date.now() - hit.at < GET_TTL) return hit.promise;
  const promise = run().catch((err) => {
    getCache.delete(url);
    throw err;
  });
  getCache.set(url, { at: Date.now(), promise });
  return promise;
};

const mapProduct = (p) => {
  if (!p) return p;
  return {
    ...p,
    price: Number(p.priceSold !== undefined ? p.priceSold : p.price),
    priceSold: Number(p.priceSold !== undefined ? p.priceSold : p.price),
    priceBought: p.priceBought !== undefined && p.priceBought !== null ? Number(p.priceBought) : null,
    originalPrice: p.originalPrice !== undefined && p.originalPrice !== null ? Number(p.originalPrice) : null,
    category: typeof p.category === 'object' && p.category !== null ? (p.category.name || '') : p.category,
    brand: typeof p.brand === 'object' && p.brand !== null ? (p.brand.name || '') : p.brand,
    gamme: typeof p.gamme === 'object' && p.gamme !== null ? (p.gamme.name || '') : p.gamme,
  };
};

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (userData) => apiRequest('/auth/register', { method: 'POST', body: userData }),
  getMe: () => apiRequest('/auth/me'),
  updateProfile: (profileData) => apiRequest('/auth/profile', { method: 'PUT', body: profileData }),

  // Products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    const data = await apiRequest(`/products${queryString ? `?${queryString}` : ''}`, { cache: true });
    return Array.isArray(data) ? data.map(mapProduct) : data;
  },
  getProduct: async (id) => {
    const data = await apiRequest(`/products/${id}`, { cache: true });
    return mapProduct(data);
  },
  getCategories: (opts = {}) => apiRequest('/products/categories', { cache: !opts.fresh }),
  getBrands: (opts = {}) => apiRequest('/products/brands', { cache: !opts.fresh }),
  getGammes: (opts = {}) => apiRequest('/products/gammes', { cache: !opts.fresh }),

  // Orders
  createOrder: (orderData) => apiRequest('/orders', { method: 'POST', body: orderData }),
  getMyOrders: () => apiRequest('/orders/my-orders'),

  // Shipping Rates & Territories
  getTerritories: () => apiRequest('/shipping/territories', { cache: true }),
  adminGetShippingRates: () => apiRequest('/admin/shipping/rates'),
  adminBulkUpdateShippingRates: (rates) => apiRequest('/admin/shipping/rates', { method: 'PATCH', body: { rates } }),

  // Public Settings
  getPublicSettings: () => apiRequest('/settings/public', { cache: true }),

  // Admin Dashboard
  getDashboardStats: (startDate, endDate) => {
    let url = '/admin/orders/dashboard/stats';
    const params = [];
    if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
    if (params.length > 0) url += '?' + params.join('&');
    return apiRequest(url);
  },

  // Admin Products
  adminGetProducts: async () => {
    const data = await apiRequest('/admin/products');
    return Array.isArray(data) ? data.map(mapProduct) : data;
  },
  adminCreateProduct: async (productData) => {
    const data = await apiRequest('/admin/products', { method: 'POST', body: productData });
    return mapProduct(data);
  },
  adminUpdateProduct: async (id, productData) => {
    const data = await apiRequest(`/admin/products/${id}`, { method: 'PUT', body: productData });
    return mapProduct(data);
  },
  adminDeleteProduct: (id) => apiRequest(`/admin/products/${id}`, { method: 'DELETE' }),

  // Admin Categories
  adminCreateCategory: (categoryData) => apiRequest('/admin/products/categories', { method: 'POST', body: categoryData }),
  adminUpdateCategory: (id, categoryData) => apiRequest(`/admin/products/categories/${id}`, { method: 'PUT', body: categoryData }),
  adminDeleteCategory: (id) => apiRequest(`/admin/products/categories/${id}`, { method: 'DELETE' }),

  // Admin Brands
  adminCreateBrand: (brandData) => apiRequest('/admin/products/brands', { method: 'POST', body: brandData }),
  adminUpdateBrand: (id, brandData) => apiRequest(`/admin/products/brands/${id}`, { method: 'PUT', body: brandData }),
  adminDeleteBrand: (id) => apiRequest(`/admin/products/brands/${id}`, { method: 'DELETE' }),

  // Admin Gammes
  adminCreateGamme: (gammeData) => apiRequest('/admin/products/gammes', { method: 'POST', body: gammeData }),
  adminUpdateGamme: (id, gammeData) => apiRequest(`/admin/products/gammes/${id}`, { method: 'PUT', body: gammeData }),
  adminDeleteGamme: (id) => apiRequest(`/admin/products/gammes/${id}`, { method: 'DELETE' }),

  // Admin Clients
  adminGetClients: () => apiRequest('/admin/clients'),
  adminCreateClient: (clientData) => apiRequest('/admin/clients', { method: 'POST', body: clientData }),
  adminUpdateClient: (id, clientData) => apiRequest(`/admin/clients/${id}`, { method: 'PUT', body: clientData }),
  adminDeleteClient: (id) => apiRequest(`/admin/clients/${id}`, { method: 'DELETE' }),
  adminToggleClientApproval: (id, approved) => apiRequest(`/admin/clients/${id}/approve`, { method: 'PUT', body: { approved } }),

  // Admin Orders
  adminGetOrders: () => apiRequest('/admin/orders'),
  adminUpdateOrderStatus: (id, status) => apiRequest(`/admin/orders/${id}`, { method: 'PUT', body: { status } }),

  // Admin Settings
  getAdminSettings: () => apiRequest('/admin/settings'),
  updateSettings: (settingsData) => apiRequest('/admin/settings', { method: 'PUT', body: settingsData }),
};
export default api;
