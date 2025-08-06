
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BiometricLogin from '../components/BiometricLogin';

const Login: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/vote');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return <BiometricLogin onLogin={login} />;
};

export default Login;
