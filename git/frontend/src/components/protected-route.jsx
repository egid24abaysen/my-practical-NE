import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ isLoggedIn, children }) {
  const location = useLocation();

  if (!isLoggedIn) {
    // Redirect to login page and save the current location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
