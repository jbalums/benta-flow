import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user } = useAuth();
  if (user?.role === 'CASHIER') return <Navigate to="/pos" replace />;
  return <Navigate to="/" replace />;
};

export default Index;
