const DEFAULT_API_URL = 'https://uni-verse-headless-cms.onrender.com/api/v1/public';
const API_URL: string = import.meta.env.VITE_CMS_API_URL || DEFAULT_API_URL;
const API_KEY = import.meta.env.VITE_CMS_API_KEY;

export const fetchCMS = async (endpoint: string, options: RequestInit = {}) => {
  if (!API_URL) throw new Error('VITE_CMS_API_URL belum diisi');
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export const cmsService = {
  getGallery: () => fetchCMS('/gallery'),
  getTemplates: () => fetchCMS('/templates'),
  getEvents: () => fetchCMS('/events'),
  getPages: () => fetchCMS('/pages'),
  getPosts: () => fetchCMS('/posts'),
  getPostById: (id: string | number) => fetchCMS(`/posts/${id}`),
  getSettings: () => fetchCMS('/settings'),
  // Add more specific methods as needed
};
