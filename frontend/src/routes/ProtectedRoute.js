import config from '~/config';

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '~/contexts/AuthContext'; // Đảm bảo đường dẫn đúng với AuthContext.js

const ProtectedRoute = ({ children, authRequired }) => {
  const { user } = useAuth();

  if (authRequired && !user) {
    return <Navigate to={config.routes.login} replace />;
  }

  // Nếu không có vấn đề gì, hiển thị nội dung route
  return children;
};

export default ProtectedRoute;