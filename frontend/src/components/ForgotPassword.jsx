import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccess(result.message);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
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
          <h1 className="text-4xl font-bold mb-8">Reset Your Password</h1>
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-6 w-6" />
              <span className="text-lg">Enter your email address</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6" />
              <span className="text-lg">Check your email for reset link</span>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowLeft className="h-6 w-6" />
              <span className="text-lg">Follow the link to reset password</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Forgot Password Form */}
      <div className="flex-1 lg:w-3/5 bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-8">
          <button
            onClick={onBackToLogin}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </button>
        </div>

        {/* Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center px-8 pb-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h2>
              <p className="text-gray-600">No worries! Enter your email and we'll send you a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email address"
                />
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
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {success}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>

            {/* Additional Help */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={onBackToLogin}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
