import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { Building, Users, MapPin, Calendar, DollarSign, Eye, Trash2 } from 'lucide-react';
import { showToast } from '../utils/toast';

const Teams = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProjectDetailsModal, setShowProjectDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showTeamInviteModal, setShowTeamInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
  // Form states
  const [createForm, setCreateForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchTeams();
    // Clear refresh param after fetching
    if (searchParams.get('refresh')) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams.get('refresh')]);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedProject(response.data);
      setShowProjectDetailsModal(true);
    } catch (error) {
      console.error('Error fetching project details:', error);
      showToast.error('Failed to load project details');
    }
  };

  const createTeamsForExistingProjects = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/teams/create-for-existing-projects`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Create teams response:', response.data);
      
      if (response.data.created_teams && response.data.created_teams.length > 0) {
        const details = response.data.details;
        showToast.success(
          `✅ Created ${response.data.created_teams.length} team(s) for your projects!`
        );
        fetchTeams(); // Refresh teams list
      } else if (response.data.details) {
        const { total_projects, projects_with_teams } = response.data.details;
        showToast.info(
          `All your ${total_projects} project(s) already have teams assigned.`
        );
      } else {
        showToast.info(response.data.message || 'All your projects already have teams assigned.');
      }
    } catch (error) {
      console.error('Error creating teams for existing projects:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      
      if (error.response) {
        const errorMsg = error.response.data?.error || error.response.data?.message || 'Failed to create teams for existing projects';
        showToast.error(`❌ ${errorMsg}`);
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        showToast.error('❌ Network error: Could not reach the server. Please check your connection.');
      } else {
        showToast.error(`❌ Failed to create teams: ${error.message}`);
      }
    }
  };

  const openTeamInviteModal = (team) => {
    setSelectedTeam(team);
    setInviteForm({ email: '', role: 'member' });
    setShowTeamInviteModal(true);
  };

  const closeTeamInviteModal = () => {
    setShowTeamInviteModal(false);
    setSelectedTeam(null);
    setInviteForm({ email: '', role: 'member' });
    setInviteLoading(false);
  };

  const sendTeamInvitation = async (e) => {
    e.preventDefault();
    console.log('Sending team invitation...', inviteForm, selectedTeam);
    
    if (!inviteForm.email) {
      showToast.error('Email is required');
      return;
    }

    if (!selectedTeam || !selectedTeam.team_id) {
      showToast.error('No team selected');
      return;
    }

    setInviteLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${apiUrl}/api/teams/${selectedTeam.team_id}/invite`,
        inviteForm,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Invitation response:', response);
      
      if (response.status === 201) {
        showToast.success('Team invitation sent successfully!');
        closeTeamInviteModal();
        fetchTeams(); // Refresh teams list
      } else {
        showToast.warning('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      console.error('Error sending team invitation:', error);
      if (error.response) {
        showToast.error(error.response.data?.error || error.response.statusText);
      } else if (error.request) {
        showToast.error('Network error: Could not reach the server');
      } else {
        showToast.error('Error: ' + error.message);
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/teams`, createForm);
      setCreateForm({ name: '', description: '' });
      setShowCreateModal(false);
      showToast.success('Team created successfully!');
      fetchTeams();
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to create team');
    }
  };

  const removeMember = async (memberUsername) => {
    if (!window.confirm(`Are you sure you want to remove ${memberUsername} from the team?`)) return;
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/teams/${selectedTeam.team_id}/members/${memberUsername}`);
      showToast.success('Member removed successfully');
      fetchTeamDetails(selectedTeam);
    } catch (error) {
      showToast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageTeam = (team) => {
    const userMember = team.members.find(m => m.username === user.username);
    return userMember && ['owner', 'admin'].includes(userMember.role);
  };

  const isTeamOwner = (team) => {
    const userMember = team.members.find(m => m.username === user.username);
    return userMember && userMember.role === 'owner';
  };

  const deleteTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to delete the team "${team.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/teams/${team.team_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      showToast.success('Team deleted successfully');
      fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error deleting team:', error);
      showToast.error(error.response?.data?.error || 'Failed to delete team');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 items-center">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your teams and collaborate with members</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end">
              <button
                onClick={fetchTeams}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reload
              </button>
              <button
                onClick={createTeamsForExistingProjects}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors text-sm"
              >
                Create Teams for My Projects
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {teams.map((team) => (
          <div key={team.team_id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-700 dark:via-blue-600 dark:to-indigo-700 p-6 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-2 text-left">
                    <h3 className="text-2xl font-bold text-white mb-2 truncate text-left">{team.name}</h3>
                    {team.description && (
                      <p className="text-blue-50/90 text-sm leading-relaxed line-clamp-2 mb-3 text-left">{team.description}</p>
                    )}
                    {team.project_id && (
                      <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-md">
                        <span className="text-xs text-blue-50 font-mono text-left">{team.project_id}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-2 shrink-0">
                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm">
                      <Users className="h-4 w-4 text-white" />
                      <span className="text-sm font-bold text-white">{team.members.length}</span>
                    </div>
                    {isTeamOwner(team) && (
                      <button
                        onClick={() => deleteTeam(team)}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-lg transition-all duration-200 shadow-sm"
                        title="Delete team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 -mt-4 text-left">
              {/* Team Members */}
              <div className="mb-5">
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 text-left">Team Members</h5>
                <div className="flex flex-wrap gap-2 justify-start">
                  {team.members.slice(0, 3).map((member) => (
                    <span
                      key={member.username}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm ${getRoleColor(member.role)} border border-gray-200 dark:border-gray-600 text-left`}
                    >
                      {member.username}
                    </span>
                  ))}
                  {team.members.length > 3 && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-500 shadow-sm text-left">
                      +{team.members.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 justify-start">
                {canManageTeam(team) && (
                  <button
                    onClick={() => openTeamInviteModal(team)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-center"
                  >
                    Invite
                  </button>
                )}
                
                {/* View Project Button for teams with associated projects */}
                {team.project_name && (
                  <button
                    onClick={() => {
                      viewProjectDetails(team.project_id);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-500 dark:to-green-600 dark:hover:from-green-600 dark:hover:to-green-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Project
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Create New Team</h2>
            <form onSubmit={createTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Team Name
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      
      {/* Project Details Modal */}
      {showProjectDetailsModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Project Details</h2>
              <button 
                onClick={() => setShowProjectDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl transition-colors"
              >
                ✕
              </button>
            </div>
            
            {/* Project Information */}
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{selectedProject.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Project ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.project_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cost</p>
                    <p className="font-medium text-gray-900 dark:text-white">${selectedProject.cost?.toLocaleString() || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.start_date || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">End Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.end_date || 'Not set'}</p>
                  </div>
                </div>
                {selectedProject.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedProject.description}</p>
                  </div>
                )}
              </div>

              {/* Team Information */}
              {selectedProject.team_info.has_team && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-300">Team Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Team ID</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedProject.team_info.team_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Member Count</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedProject.team_info.member_count} members</p>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Team Members</h5>
                    <div className="space-y-2">
                      {selectedProject.team_members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{member.username}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.role === 'owner' 
                              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' 
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
                          }`}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* No Team Message */}
              {!selectedProject.team_info.has_team && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <h4 className="text-lg font-semibold text-yellow-900 dark:text-yellow-300">No Team Assigned</h4>
                  </div>
                  <p className="text-yellow-800 dark:text-yellow-200">This project doesn't have a team assigned yet.</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowProjectDetailsModal(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Team Invitation Modal */}
      {showTeamInviteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Invite Team Member
              </h2>
              <button 
                onClick={closeTeamInviteModal}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {selectedTeam.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Invite a new member to join this team
                </p>
              </div>
              
              <form onSubmit={sendTeamInvitation} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeTeamInviteModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {inviteLoading ? 'Sending...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Teams;
