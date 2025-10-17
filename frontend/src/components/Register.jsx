import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, UserPlus, BarChart3, Calendar, FileText, IndianRupee, Shield, Mail, User2 } from 'lucide-react';
import axios from 'axios';
import PlanGridLogo from '/PlanGrid.jpg';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register: registerUser, login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitationInfo, setInvitationInfo] = useState(null);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const inviteToken = searchParams.get('invite');

  // Fetch invitation details on mount
  useEffect(() => {
    if (inviteToken) {
      fetchInvitationDetails(inviteToken);
    } else {
      setLoadingInvitation(false);
      setError('No invitation token provided. Please use a valid invitation link.');
    }
  }, [inviteToken]);

  const fetchInvitationDetails = async (token) => {
    try {
      setLoadingInvitation(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/teams/invitations/${token}`
      );
      
      const invitation = response.data;
      setInvitationInfo(invitation);
      
      // Pre-fill email if available
      if (invitation.email) {
        setFormData(prev => ({
          ...prev,
          email: invitation.email
        }));
      }
      
      setLoadingInvitation(false);
    } catch (error) {
      console.error('Error fetching invitation details:', error);
      setError(error.response?.data?.error || 'Invalid or expired invitation link');
      setLoadingInvitation(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'username' || name === 'email' ? value.toLowerCase() : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions');
      setLoading(false);
      return;
    }

    try {
      // Step 1: Register the user
      const registerResult = await registerUser(formData.username, formData.email, formData.password);
      
      if (!registerResult.success) {
        setError(registerResult.error || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }
      
      // Step 2: Automatically log in the user
      const loginResult = await login(formData.username, formData.password);
      
      if (!loginResult.success) {
        setError('Registration successful but login failed. Please login manually.');
        setLoading(false);
        return;
      }
      
      // Step 3: Determine invitation type and redirect
      const isProjectInvitation = invitationInfo?.type === 'project_invitation';
      const invitationPath = isProjectInvitation ? 'project-invitation' : 'team-invitation';
      
      // Step 4: Redirect to invitation acceptance page with autoAccept flag
      // User is now logged in with JWT token, so auto-accept will work
      navigate(`/${invitationPath}?token=${inviteToken}&autoAccept=true&newUser=true`);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || 'An error occurred during registration');
      setLoading(false);
    }
  };

  // Loading state for invitation
  if (loadingInvitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  // Error state (invalid invitation)
  if (!invitationInfo && !loadingInvitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center">
          <div className="text-5xl sm:text-6xl mb-4">❌</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Blue Gradient with Features */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-400 rounded-full -translate-x-16 -translate-y-16 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-400 rounded-full translate-x-20 translate-y-20 opacity-20"></div>
        <div className="absolute top-8 left-8 grid grid-cols-4 gap-2 opacity-30">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-blue-200 rounded-full"></div>
          ))}
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Join PlanGrid</h1>
          <p className="text-xl mb-8 text-blue-100">
            You're invited to collaborate on material forecasting and project management
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg">Material Demand Forecasting</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg">Project Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg">Purchase Request System</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg">Inventory Tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <IndianRupee className="h-6 w-6 flex-shrink-0" />
              <span className="text-lg">Project Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 lg:w-3/5 bg-gray-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
              <img src={PlanGridLogo} alt="PlanGrid" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-blue-600">PlanGrid</span>
          </div>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 text-sm font-medium text-blue-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            LOGIN
          </button>
        </div>

        {/* Registration Form */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-8 py-6 sm:pb-8">
          <div className="w-full max-w-md">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6">Join your team and start collaborating</p>

            {/* Invitation Info Banner */}
            {invitationInfo && (
              <div className="mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="text-2xl sm:text-3xl mr-2 sm:mr-3 flex-shrink-0">
                    {invitationInfo.type === 'project_invitation' ? '📁' : '🤝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">
                      {invitationInfo.type === 'project_invitation' ? 'Project Invitation' : 'Team Invitation'}
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-800 break-words">
                      Join <strong className="font-semibold">
                        {invitationInfo.type === 'project_invitation' 
                          ? invitationInfo.project_name 
                          : invitationInfo.team_name}
                      </strong> as <strong className="font-semibold">{invitationInfo.role}</strong>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Invited by {invitationInfo.invited_by}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={invitationInfo?.email}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                </div>
                {invitationInfo?.email && (
                  <p className="text-xs text-gray-500 mt-1">Email is pre-filled from your invitation</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
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
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-700 cursor-pointer">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    Terms and Conditions
                  </a>
                  {' '}and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500 underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account & Join {invitationInfo?.type === 'project_invitation' ? 'Project' : 'Team'}
                  </>
                )}
              </button>
            </form>

            {/* Already have account */}
            <div className="mt-6 text-center text-xs sm:text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/auth')}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

