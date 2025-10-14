import axios from 'axios';
//https://api-sistem-za-evidenciju.onrender.com/api
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://api-sistem-za-evidenciju.onrender.com/api',
    withCredentials: true,
});


export default api;