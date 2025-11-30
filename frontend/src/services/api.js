import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api', // Proxied through Vite to http://localhost:5000/api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging (optional)
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== CAMPAIGN APIs ====================

export const campaignAPI = {
  getAll: (params) => api.get('/campaigns', { params }),
  getOne: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getStats: () => api.get('/campaigns/stats/overview'),
};

// ==================== TRANSACTION APIs ====================

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getOne: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getIncomeSummary: (params) => api.get('/transactions/income/summary', { params }),
  getExpenseSummary: (params) => api.get('/transactions/expense/summary', { params }),
};

// ==================== INVOICE APIs ====================

export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  markAsPaid: (id, data) => api.patch(`/invoices/${id}/pay`, data),
  getStats: () => api.get('/invoices/stats/overview'),
};

// ==================== DASHBOARD APIs ====================

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
  getFinancialSummary: (params) => api.get('/dashboard/summary', { params }),
  getMarketingSummary: () => api.get('/dashboard/marketing'),
};

// ==================== REPORT APIs ====================

export const reportAPI = {
  getFinancial: (params) => api.get('/reports/financial', { params }),
  getMarketing: (params) => api.get('/reports/marketing', { params }),
  getInvoices: (params) => api.get('/reports/invoices', { params }),
  getComprehensive: (params) => api.get('/reports/comprehensive', { params }),
};

export default api;


