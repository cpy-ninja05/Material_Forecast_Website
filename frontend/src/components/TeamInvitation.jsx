import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showToast } from '../utils/toast';

const TeamInvitation = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  // Get invitation token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get('token');
  const autoAccept = urlParams.get('autoAccept') === 'true';
  const newUser = urlParams.get('newUser') === 'true';

  useEffect(() => {
    const fetchInvitationDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/teams/invitations/${invitationToken}`);
        console.log('Invitation details:', response.data);
        setInvitation(response.data);
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setError(error.response?.data?.error || 'Invalid or expired invitation');
      } finally {
        setLoading(false);
      }
    };

    if (invitationToken) {
      console.log('Fetching invitation with token:', invitationToken);
      fetchInvitationDetails();
    } else {
      console.log('No invitation token found in URL');
      setError('No invitation token provided');
      setLoading(false);
    }
  }, [invitationToken]);

  // Auto-accept invitation if coming from registration
  useEffect(() => {
    if (autoAccept && newUser && invitation && user && !accepting && !error) {
      console.log('Auto-accepting invitation for new user...');
      console.log('User:', user.username);
      console.log('Invitation:', invitation);
      acceptInvitation();
    }
  }, [autoAccept, newUser, invitation, user]);

  const acceptInvitation = async () => {
    if (!user) {
      // Redirect to login with invitation token
      navigate(`/login?invite=${invitationToken}`);
      return;
    }

    setAccepting(true);
    try {
      console.log('Accepting invitation for user:', user.username);
      console.log('Token from localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      // Determine if this is a team or project invitation
      const isProjectInvitation = invitation?.type === 'project_invitation';
      const endpoint = isProjectInvitation 
        ? `/api/projects/invitations/${invitationToken}/accept`
        : `/api/teams/invitations/${invitationToken}/accept`;
      
      console.log('Calling endpoint:', endpoint);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      console.log('Invitation accepted successfully:', response.data);
      
      // Refresh user data to get updated team information
      await refreshUser();
      
      if (isProjectInvitation) {
        showToast.success('Successfully joined the project!');
        navigate('/projects?refresh=true');
      } else {
        showToast.success('Successfully joined the team!');
        navigate('/teams?refresh=true');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to accept invitation');
      showToast.error(error.response?.data?.error || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading || (accepting && autoAccept && newUser)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {accepting && autoAccept && newUser 
              ? `Joining ${invitation?.type === 'project_invitation' ? 'project' : 'team'}...` 
              : 'Loading invitation...'}
          </p>
          {newUser && accepting && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Welcome! Setting up your account...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🤝</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {invitation?.type === 'project_invitation' ? 'Project Invitation' : 'Team Invitation'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {invitation?.type === 'project_invitation' 
              ? 'You\'ve been invited to join a project!'
              : 'You\'ve been invited to join a team!'
            }
          </p>
        </div>

        {invitation && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {invitation.type === 'project_invitation' ? invitation.project_name : invitation.team_name}
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <p><span className="font-medium">Role:</span> {invitation.role}</p>
              <p><span className="font-medium">Invited by:</span> {invitation.invited_by}</p>
              <p><span className="font-medium">Invited on:</span> {new Date(invitation.created_at).toLocaleDateString()}</p>
              {invitation.type === 'project_invitation' && (
                <p><span className="font-medium">Project ID:</span> {invitation.project_id}</p>
              )}
            </div>
          </div>
        )}

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              Welcome back, <span className="font-medium">{user.username}</span>!
            </p>
            <button
              onClick={acceptInvitation}
              disabled={accepting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? 'Accepting...' : 'Accept Invitation'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
              You need to be logged in to accept this invitation.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/auth?invite=${invitationToken}`)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login to Accept
              </button>
              <button
                onClick={() => navigate(`/register?invite=${invitationToken}`)}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamInvitation;
