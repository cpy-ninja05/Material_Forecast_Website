import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, BarChart3, Calendar, FileText, IndianRupee, Shield } from 'lucide-react';
import axios from 'axios';
import PlanGridLogo from '/PlanGrid.jpg';
import ForgotPassword from './ForgotPassword';

const Login = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'username' ? value.toLowerCase() : value
    });
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Blue Gradient */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full -translate-x-16 -translate-y-16 opacity-20"></div>
        <div className="absolute top-8 left-8 grid grid-cols-4 gap-2 opacity-30">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-blue-200 rounded-full"></div>
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-8">Material Forecast Portal</h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6" />
              <span className="text-lg">Material Demand Forecasting</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6" />
              <span className="text-lg">Project Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6" />
              <span className="text-lg">Purchase Request System</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6" />
              <span className="text-lg">Inventory Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-6 w-6" />
              <span className="text-lg">Project Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 lg:w-3/5 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-blue-600">PlanGrid</span>
          </div>
          <button
            onClick={onSwitchToRegister}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            REGISTER
          </button>
        </div>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your username"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="******"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700">Save User</span>
                </label>
                <button 
                  type="button" 
                  onClick={onSwitchToForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'LOGIN'}
              </button>
            </form>

            {/* Sample Credentials Info */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <h3 className="font-semibold text-blue-900 text-lg mb-3">Sample Credentials</h3>
              <div className="space-y-2">
                <p className="text-base text-blue-800">
                  <strong>Username:</strong> sample
                </p>
                <p className="text-base text-blue-800">
                  <strong>Password:</strong> sample
                </p>
              </div>
              <p className="text-sm text-blue-600 mt-3">
                Use these credentials for demo access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState(null);
  const { register, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Check for invitation token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    if (inviteToken) {
      fetchInvitationDetails(inviteToken);
    }
  }, []);

  const fetchInvitationDetails = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/teams/invitations/${token}`);
      setInvitationInfo(response.data);
    } catch (error) {
      console.error('Error fetching invitation details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await register(formData.username, formData.email, formData.password);
    
    if (result.success) {
      setSuccess('Registration successful! Redirecting...');
      
      // If there's an invitation, accept it after registration
      const urlParams = new URLSearchParams(window.location.search);
      const inviteToken = urlParams.get('invite');
      
      if (inviteToken) {
        try {
          // Determine if this is a team or project invitation
          const isProjectInvitation = invitationInfo?.type === 'project_invitation';
          const endpoint = isProjectInvitation 
            ? `/api/projects/invitations/${inviteToken}/accept`
            : `/api/teams/invitations/${inviteToken}/accept`;
          
          await axios.post(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`);
          
          // Refresh user data to get updated team information
          await refreshUser();
          
          if (isProjectInvitation) {
            setSuccess('Registration successful! You have been added to the project. Redirecting...');
          } else {
            setSuccess('Registration successful! You have been added to the team. Redirecting...');
          }
        } catch (error) {
          console.error('Error accepting invitation:', error);
        }
      }
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'username' || name === 'email' ? value.toLowerCase() : value
    });
  };

  return (
    <div className="h-screen flex">
      {/* Left Panel - Blue Gradient */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full -translate-x-16 -translate-y-16 opacity-20"></div>
        <div className="absolute top-8 left-8 grid grid-cols-4 gap-2 opacity-30">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-blue-200 rounded-full"></div>
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-8">Join PLANGRID</h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6" />
              <span className="text-lg">Material Demand Forecasting</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6" />
              <span className="text-lg">Project Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6" />
              <span className="text-lg">Purchase Request System</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6" />
              <span className="text-lg">Inventory Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-6 w-6" />
              <span className="text-lg">Project Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex-1 lg:w-3/5 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-blue-600">PLANGRID</span>
          </div>
          <button
            onClick={onSwitchToLogin}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            LOGIN
          </button>
        </div>

        {/* Register Form */}
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Create Account</h2>

            {/* Team Invitation Info */}
            {invitationInfo && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="text-2xl mr-2">🤝</div>
                  <h3 className="font-semibold text-blue-900">Team Invitation</h3>
                </div>
                <p className="text-sm text-blue-800">
                  You're joining <strong>{invitationInfo.team_name}</strong> as a <strong>{invitationInfo.role}</strong>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Invited by {invitationInfo.invited_by}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Choose a username"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input type="checkbox" className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">
                  I agree to the <a href="#" className="text-blue-600 hover:text-blue-500">Terms and Conditions</a>
                </span>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {showForgotPassword ? (
        <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
      ) : isLogin ? (
        <Login 
          onSwitchToRegister={() => setIsLogin(false)} 
          onSwitchToForgotPassword={() => setShowForgotPassword(true)}
        />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </>
  );
};

export default AuthPage;
