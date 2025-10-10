import axios from 'axios';

const configuredAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:5000',
});

// Function to get the token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Add a request interceptor to include the token in headers
configuredAxios.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token added to request headers:", token); // Add this line
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Function to get the admin token from localStorage
const getAdminToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('adminToken');
  }
  return null;
};

export { configuredAxios, getAdminToken };
