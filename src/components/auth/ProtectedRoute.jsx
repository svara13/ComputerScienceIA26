
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingOverlay } from '@mantine/core';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay visible />;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
