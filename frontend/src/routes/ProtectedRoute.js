import config from '~/config';

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '~/contexts/AuthContext'; // Đảm bảo đường dẫn đúng với AuthContext.js

const ProtectedRoute = ({ children, authRequired, adminAuthRequired }) => {
  const { user } = useAuth();
  if (authRequired && !user) {
    
    return <Navigate to={config.routes.login} replace />;
  }
  if (adminAuthRequired && user && user.role) {
    return <Navigate to={config.routes.home} replace />;
  }
  return children;
};

export default ProtectedRoute;