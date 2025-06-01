import axios from 'axios';

const API_BASE_URL = 'http://localhost:8008';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const youtubeAPI = {
  // Thu thập dữ liệu
  extractData: (searchParams) => 
    api.post('/api/extract', searchParams),
  
  // Lấy dữ liệu dashboard
  getDashboard: () => 
    api.get('/api/dashboard'),
  
  // Lấy danh sách video
  getVideos: () => 
    api.get('/api/videos'),
  
  // Lấy bình luận
  getComments: () => 
    api.get('/api/comments'),
  
  // Lấy thống kê
  getStatistics: () => 
    api.get('/api/statistics'),
  
  // Lấy phân tích cảm xúc
  getSentiment: () => 
    api.get('/api/sentiment'),
};

export default api;
