import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { Role } from '@/types';

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

const RouteGuard: React.FC<Props> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    const fallbackPath = user.role === 'CASHIER' ? '/pos' : '/my-store';
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
