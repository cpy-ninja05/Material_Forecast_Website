import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token and get user info with role
      axios.get('http://localhost:5000/api/me')
        .then((res) => {
          setUser({ username: res.data.username, role: res.data.role, email: res.data.email });
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });
      
      const { access_token, user: userData } = response.data;
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', {
        email
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to send reset email' 
      };
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await axios.post('http://localhost:5000/api/reset-password', {
        token,
        new_password: newPassword
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to reset password' 
      };
    }
  };

  const verifyResetToken = async (token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/verify-reset-token', {
        token
      });
      return { success: true, valid: response.data.valid, email: response.data.email };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to verify token' 
      };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    forgotPassword,
    resetPassword,
    verifyResetToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
