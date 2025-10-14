import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Shield, Lock } from 'lucide-react';
import PlanGridLogo from '/PlanGrid.jpg';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset email sent! Check your inbox and follow the instructions.');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-400 rounded-full translate-x-12 translate-y-12 opacity-20"></div>
        
        {/* Content */}
        <div className="flex flex-col justify-center items-center text-center text-white p-12 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm">
            <img src={PlanGridLogo} alt="PlanGrid" className="w-10 h-10 object-cover rounded-full" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Forgot Password?</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Don't worry! Enter your email address and we'll send you a secure link to reset your password.
          </p>
          
          {/* Security Features */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 text-blue-100">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Secure password reset process</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-100">
              <Lock className="h-5 w-5" />
              <span className="text-sm">One-time use reset links</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-100">
              <Mail className="h-5 w-5" />
              <span className="text-sm">Email verification required</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
              <img src={PlanGridLogo} alt="PlanGrid" className="w-8 h-8 object-cover rounded-full" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot Password</h2>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Your Password</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your email address below
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                      Error
                    </h3>
                    <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {message && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      Email Sent Successfully!
                    </h3>
                    <div className="text-sm text-green-700 dark:text-green-300 leading-relaxed space-y-2">
                      <p>We've sent a password reset link to your email address.</p>
                      <div className="bg-green-100 dark:bg-green-800/30 p-3 rounded-md">
                        <p className="font-medium">Next Steps:</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          <li>• Check your inbox (and spam folder)</li>
                          <li>• Click the reset link in the email</li>
                          <li>• Create a new password</li>
                          <li>• Link expires in 1 hour for security</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reset Link
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
