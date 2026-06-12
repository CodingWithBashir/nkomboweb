import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Handle unauthorized
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API Functions
export const fetchHeroData = async () => {
  const { data } = await api.get('/hero');
  return data;
};

export const fetchFeatures = async () => {
  const { data } = await api.get('/features');
  return data;
};

export const fetchStats = async () => {
  const { data } = await api.get('/statistics');
  return data;
};

export const fetchNews = async (page = 1, limit = 6, category?: string) => {
  const params = { page, limit, ...(category && category !== 'all' && { category }) };
  const { data } = await api.get('/news', { params });
  return data;
};

export const fetchEvents = async () => {
  const { data } = await api.get('/events');
  return data;
};

export const fetchTestimonials = async () => {
  const { data } = await api.get('/testimonials');
  return data;
};

export const fetchFAQ = async () => {
  const { data } = await api.get('/faq');
  return data;
};

export const fetchAnnouncements = async () => {
  const { data } = await api.get('/announcements');
  return data;
};

export const submitContactForm = async (formData: any) => {
  const { data } = await api.post('/contact', formData);
  return data;
};

export const subscribeNewsletter = async (email: string) => {
  const { data } = await api.post('/newsletter/subscribe', { email });
  return data;
};

export default api;