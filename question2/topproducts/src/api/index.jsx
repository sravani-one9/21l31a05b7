import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://20.244.56.144/test', // Replace with your backend API URL
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAllProducts = (filters = {}) => {
    return apiClient.get('/companies', { params: filters });
};

export const getProductById = (id) => {
    return apiClient.get(`/companies/${id}`);
};
