import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const axiosInstance = axios.create({ baseURL: API_URL });

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const getUsersBatch = async (userIds) => {
  const response = await axiosInstance.post('/users/batch', { userIds });
  return response.data;
};

export const getProfileUser = async (username, token) => {
  const response = await axiosInstance.get(`/users/profile/${username}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return response.data;
};

export const followUser = async (userId, token) => {
  const response = await axiosInstance.post(
    '/users/follow',
    { userId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const unfollowUser = async (userId, token) => {
  const response = await axiosInstance.post(
    '/users/unfollow',
    { userId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const updateUser = async (userId, userData, token) => {
  const response = await axiosInstance.put(`/users/${userId}`, userData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const toggleVerification = async (userId, token) => {
  const response = await axiosInstance.patch(`/users/${userId}/toggle-verification`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteUser = async (userId, token) => {
  const response = await axiosInstance.delete(`/users/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const searchAllUsers = async ({ q }) => {
  const response = await axiosInstance.get('/users/search', {
    params: { q },
  });
  return response.data;
};

// Lấy danh sách quốc gia từ REST Countries
export const getCountries = async () => {
  try {
    const response = await axios.get('https://restcountries.com/v3.1/all');
    return response.data.map(country => ({
      name: country.name.common,
      code: country.cca2,
    })).sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
};

export const getCities = async (countryCode) => {
  const cityMap = {
    US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
    VN: [
      'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn', 
      'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 
      'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 
      'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 
      'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình', 
      'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 
      'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 
      'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 
      'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 
      'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 
      'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 
      'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái', 
      'Hà Nội', 'TP. Hồ Chí Minh', 'Hải Phòng', 'Đà Nẵng', 'Cần Thơ'
    ],
    JP: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya'],
  };
  return cityMap[countryCode] || [];
};