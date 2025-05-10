import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyUser } from '~/services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [following, setFollowing] = useState([]);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    const savedFollowing = localStorage.getItem('following'); // Lấy following từ localStorage

    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);

        // Khôi phục following nếu có
        if (savedFollowing) {
          const parsedFollowing = JSON.parse(savedFollowing);
          setFollowing(parsedFollowing);
        }

        verifyUser(savedToken)
          .then(data => {
            if (!data.success || !data.valid) {
              logout();
            }
          })
          .catch(err => {
            console.error('Lỗi xác minh token:', err);
            logout();
          });
      } catch (err) {
        console.error('Lỗi parse user:', err);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData, followingData) => {
    setFollowing(followingData);
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    localStorage.setItem('following', JSON.stringify(followingData)); // Lưu following vào localStorage
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setFollowing([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('following');
  };

  return (
    <AuthContext.Provider value={{ user, following, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);