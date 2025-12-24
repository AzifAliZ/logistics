import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Updated to include /api prefix
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getOrders = (params) => api.get('/orders/list/', { params });
export const getOrder = (id) => api.get(`/orders/${id}/`);
export const createOrder = (data) => api.post('/orders/', data);
export const updateOrderStatus = (id, data) => api.post(`/orders/${id}/status/`, data);
export const getOrderHistory = (id) => api.get(`/orders/${id}/history/`);

export default api;
