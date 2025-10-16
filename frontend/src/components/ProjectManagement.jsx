import React, { useState, useEffect } from 'react';
import { Building, MapPin, Calendar, DollarSign, TrendingUp, Plus, Edit, Eye, BarChart3, Grid3X3, AlertCircle, CheckCircle, Clock, Save, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { showToast } from '../utils/toast';

// Edit Project Form Component
const EditProjectForm = ({ project, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: project.name || '',
    location: project.location || '',
    state: project.state || '',
    city: project.city || '',
    status: project.status || 'PLANNED',
    tower_type: project.tower_type || 'Suspension',
    substation_type: project.substation_type || '132 kV AIS',
    cost: project.cost || 0,
    start_date: project.start_date || '',
    end_date: project.end_date || '',
    project_size_km: project.project_size_km || 0,
    description: project.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...project, ...formData });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Location
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select specific location</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="Central">Central</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tower Type *
          </label>
          <select
            name="tower_type"
            value={formData.tower_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Suspension">Suspension</option>
            <option value="Tension">Tension</option>
            <option value="Terminal">Terminal</option>
            <option value="Transposition">Transposition</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Substation Type *
          </label>
          <select
            name="substation_type"
            value={formData.substation_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="132 kV AIS">132 kV AIS</option>
            <option value="132 kV GIS">132 kV GIS</option>
            <option value="220 kV AIS">220 kV AIS</option>
            <option value="220 kV GIS">220 kV GIS</option>
            <option value="400 kV AIS">400 kV AIS</option>
            <option value="400 kV GIS">400 kV GIS</option>
            <option value="765 kV AIS">765 kV AIS</option>
            <option value="765 kV GIS">765 kV GIS</option>
            <option value="HVDC">HVDC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (₹)
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="1000000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Size (km) *
          </label>
          <input
            type="number"
            name="project_size_km"
            value={formData.project_size_km}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.1"
            placeholder="Enter project size in kilometers"
            required
          />
        </div>

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter project description..."
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>
    </form>
  );
};

// Create Project Form Component
const CreateProjectForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    state: '',
    city: '',
    status: 'PLANNED',
    tower_type: 'Suspension',
    substation_type: '132 kV AIS',
    cost: 0,
    start_date: '',
    end_date: '',
    project_size_km: 0,
    description: '',
    team_id: ''  // Add team selection
  });
  
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/teams`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter project name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State/Province *
          </label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter state or province"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City *
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter city name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specific Location
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select specific location</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="Central">Central</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tower Type *
          </label>
          <select
            name="tower_type"
            value={formData.tower_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="Suspension">Suspension</option>
            <option value="Tension">Tension</option>
            <option value="Terminal">Terminal</option>
            <option value="Transposition">Transposition</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Substation Type *
          </label>
          <select
            name="substation_type"
            value={formData.substation_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="132 kV AIS">132 kV AIS</option>
            <option value="132 kV GIS">132 kV GIS</option>
            <option value="220 kV AIS">220 kV AIS</option>
            <option value="220 kV GIS">220 kV GIS</option>
            <option value="400 kV AIS">400 kV AIS</option>
            <option value="400 kV GIS">400 kV GIS</option>
            <option value="765 kV AIS">765 kV AIS</option>
            <option value="765 kV GIS">765 kV GIS</option>
            <option value="HVDC">HVDC</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PLANNED">Planned</option>
            <option value="IN PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget (₹) *
          </label>
          <input
            type="number"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter budget in rupees"
            min="0"
            step="1000000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Size (km) *
          </label>
          <input
            type="number"
            name="project_size_km"
            value={formData.project_size_km}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            step="0.1"
            placeholder="Enter project size in kilometers"
            required
          />
        </div>

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter project description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assign to Team (Optional)
        </label>
        <select
          name="team_id"
          value={formData.team_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loadingTeams}
        >
          <option value="">No team assigned</option>
          {teams.map((team) => (
            <option key={team.team_id} value={team.team_id}>
              {team.name} ({team.members.length} members)
            </option>
          ))}
        </select>
        {loadingTeams && (
          <p className="text-sm text-gray-500 mt-1">Loading teams...</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>
    </form>
  );
};

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showActualValuesModal, setShowActualValuesModal] = useState(false);
  const [actualValues, setActualValues] = useState({});
  const [forecastData, setForecastData] = useState(null);
  const [materialActualValues, setMaterialActualValues] = useState({});
  const [loadingActuals, setLoadingActuals] = useState(false);
  const [isSampleData, setIsSampleData] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState('');
  const [projectForecasts, setProjectForecasts] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTeamInviteModal, setShowTeamInviteModal] = useState(false);
  const [invitingProject, setInvitingProject] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'member' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [error, setError] = useState('');
  const [chartView, setChartView] = useState('tons');
  const [forecastMonths, setForecastMonths] = useState([]); // YYYY-MM strings with predictions only
  const [selectedForecastMonth, setSelectedForecastMonth] = useState(null);

  // Target materials from the model
  const targetMaterials = [
    { key: 'quantity_steel_tons', name: 'Steel (Tons)', unit: 'tons' },
    { key: 'quantity_copper_tons', name: 'Copper (Tons)', unit: 'tons' },
    { key: 'quantity_cement_tons', name: 'Cement (Tons)', unit: 'tons' },
    { key: 'quantity_aluminum_tons', name: 'Aluminum (Tons)', unit: 'tons' },
    { key: 'quantity_insulators_count', name: 'Insulators', unit: 'units' },
    { key: 'quantity_conductors_tons', name: 'Conductors (Tons)', unit: 'tons' },
    { key: 'quantity_transformers_count', name: 'Transformers', unit: 'units' },
    { key: 'quantity_switchgears_count', name: 'Switchgears', unit: 'units' },
    { key: 'quantity_cables_count', name: 'Cables', unit: 'units' },
    { key: 'quantity_protective_relays_count', name: 'Protective Relays', unit: 'units' },
    { key: 'quantity_oil_tons', name: 'Oil (Tons)', unit: 'tons' },
    { key: 'quantity_foundation_concrete_tons', name: 'Foundation Concrete (Tons)', unit: 'tons' },
    { key: 'quantity_bolts_count', name: 'Bolts', unit: 'units' }
  ];

  // Debug: Log month info when component loads
  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjectForecasts = async (projectId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}/forecasts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProjectForecasts(prev => ({
        ...prev,
        [projectId]: response.data || []
      }));
    } catch (error) {
      console.error('Failed to load project forecasts:', error);
    }
  };

  const getCurrentMonthKey = () => new Date().toISOString().slice(0, 7); // YYYY-MM

  const formatMonth = (ym) => {
    if (!ym) return '';
    const [y, m] = ym.split('-').map(Number);
    const d = new Date(y, (m || 1) - 1, 1);
    return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  };

  const selectForecastMonth = (month, listByMonth) => {
    const list = listByMonth || (projectForecasts[selectedProject?.project_id] || []);
    const match = list.find(f => f.forecast_month === month);
    if (!match) return;
    setSelectedForecastMonth(month);
    setForecastData(match.predictions || null);
    if (match.actual_values && Object.keys(match.actual_values).length > 0) {
      setMaterialActualValues(match.actual_values);
      setIsSampleData(false);
    } else {
      setMaterialActualValues(match.actual_values || {});
      setIsSampleData(true);
    }
    setForecastError('');
  };

  const loadProjects = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects`);
      setProjects(response.data);
      
      // Load forecasts for each project
      response.data.forEach(project => {
        loadProjectForecasts(project.project_id);
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Use sample data if API fails
      setProjects([
        {
          project_id: 'P0001',
          name: 'Mumbai-Pune Transmission Line',
          location: 'Mumbai, Maharashtra',
          status: 'IN PROGRESS',
          type: 'Transmission Tower',
          cost: 50000000,
          start_date: '2024-01-15',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          project_id: 'P0002',
          name: 'Delhi Grid Substation',
          location: 'Delhi, NCR',
          status: 'PLANNED',
          type: 'Substation',
          cost: 35000000,
          start_date: '2024-02-20',
          created_at: '2024-01-15T00:00:00Z'
        },
        {
          project_id: 'P0003',
          name: 'Bangalore Ring Road Transmission',
          location: 'Bangalore, Karnataka',
          status: 'IN PROGRESS',
          type: 'Transmission Tower',
          cost: 42000000,
          start_date: '2024-01-10',
          created_at: '2024-01-10T00:00:00Z'
        },
        {
          project_id: 'P0004',
          name: 'Chennai Power Grid',
          location: 'Chennai, Tamil Nadu',
          status: 'COMPLETED',
          type: 'Substation',
          cost: 28000000,
          start_date: '2023-12-05',
          created_at: '2023-12-01T00:00:00Z'
        },
        {
          project_id: 'P0005',
          name: 'Kolkata Distribution Network',
          location: 'Kolkata, West Bengal',
          status: 'IN PROGRESS',
          type: 'Transmission Tower',
          cost: 39000000,
          start_date: '2024-01-25',
          created_at: '2024-01-20T00:00:00Z'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const redirectToForecasting = () => {
    // Store the selected project in localStorage so ForecastingPage can pre-select it
    if (selectedProject) {
      localStorage.setItem('selectedProjectForForecast', JSON.stringify(selectedProject));
    }
    // Navigate to forecasting page
    window.location.href = '/forecasting';
  };

  const generateForecast = async (project) => {
    console.log('Generating forecast for project:', project);
    setSelectedProject(project);
    
    // Load existing forecast data for this project
    await loadProjectData(project.project_id);
    
    setShowForecastModal(true);
  };

  const openActualValuesModal = async (project) => {
    console.log('Opening actual values modal for project:', project);
    setSelectedProject(project);
    
    // Load existing forecast data for this project
    await loadProjectData(project.project_id);
    
    setShowActualValuesModal(true);
  };

  const calculateMaterialMetrics = (materialValues, forecastData) => {
    // Calculate total actual quantity
    const totalActual = Object.values(materialValues).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0);

    // Calculate total forecast quantity
    const totalForecast = forecastData ? Object.values(forecastData).reduce((sum, value) => {
      return sum + (parseFloat(value) || 0);
    }, 0) : 0;

    // Calculate accuracy percentage
    const accuracyPercentage = totalForecast > 0 ? 
      Math.round(((totalActual / totalForecast) * 100) * 10) / 10 : 0;

    // Calculate variance (actual - forecast)
    const variance = totalActual - totalForecast;
    const variancePercentage = totalForecast > 0 ? 
      Math.round((variance / totalForecast) * 100 * 10) / 10 : 0;

    return {
      totalActual,
      totalForecast,
      accuracyPercentage,
      variance,
      variancePercentage,
      status: accuracyPercentage >= 95 ? 'Excellent' : 
              accuracyPercentage >= 90 ? 'Good' : 
              accuracyPercentage >= 80 ? 'Fair' : 'Poor'
    };
  };

  const loadProjectData = async (projectId) => {
    try {
      // Get the latest forecast for this project
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}/forecasts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data && response.data.length > 0) {
        // Keep only months that have predictions
        const forecastsWithPreds = response.data.filter(f => f && f.predictions && Object.keys(f.predictions).length > 0);
        const months = forecastsWithPreds.map(f => f.forecast_month).filter(Boolean);
        setForecastMonths(months);

        // Choose current month if present, otherwise latest available
        const currentKey = getCurrentMonthKey();
        const byMonth = forecastsWithPreds;
        const chosen = byMonth.find(f => f.forecast_month === currentKey) || byMonth[0];
        if (chosen) {
          selectForecastMonth(chosen.forecast_month, byMonth);
        }

        console.log('Loaded forecast months:', months);
      } else {
        setForecastError('No forecast data available for this project. Please generate a forecast first.');
        setForecastData(null);
        setMaterialActualValues({});
        setForecastMonths([]);
        setSelectedForecastMonth(null);
      }
    } catch (error) {
      console.error('Failed to load project data:', error);
      setForecastError('Failed to load forecast data');
      setForecastData(null);
      setMaterialActualValues({});
      setForecastMonths([]);
      setSelectedForecastMonth(null);
    }
  };

  // No longer needed - actual values are generated dynamically
  const saveMaterialActuals = async (projectId, materialValues) => {
    try {
      console.log('Saving material values for project:', projectId);
      console.log('Material values:', materialValues);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}/actual-values`,
        { actual_values: materialValues },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Save response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to save actual values:', error);
      throw error;
    }
  };

  const handleMaterialValueChange = (materialKey, value) => {
    setMaterialActualValues(prev => ({
      ...prev,
      [materialKey]: value
    }));
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  const openDeleteModal = (project) => {
    setDeletingProject(project);
    setShowDeleteModal(true);
  };

  const openTeamInviteModal = (project) => {
    setInvitingProject(project);
    setInviteForm({ email: '', role: 'member' });
    setShowTeamInviteModal(true);
  };

  const closeTeamInviteModal = () => {
    setShowTeamInviteModal(false);
    setInvitingProject(null);
    setInviteForm({ email: '', role: 'member' });
    setInviteLoading(false);
    setError('');
  };

  const sendTeamInvitation = async () => {
    if (!inviteForm.email) {
      setError('Email is required');
      return;
    }

    setInviteLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/${invitingProject.project_id}/invite-team`,
        inviteForm,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.status === 201) {
        showToast.success('Team invitation sent successfully!');
        closeTeamInviteModal();
      }
    } catch (error) {
      console.error('Error sending team invitation:', error);
      setError(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleEditProject = async (updatedProject) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${updatedProject.project_id}`, updatedProject);
      
      // Update the local projects state
      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.project_id === updatedProject.project_id ? { ...p, ...updatedProject } : p
        )
      );
      
        setShowEditModal(false);
      showToast.success('Project updated successfully!');
    } catch (error) {
      console.error('Failed to update project:', error);
      showToast.error('Failed to update project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/projects/${projectId}`);
      
      // Remove the project from local state
      setProjects(prevProjects => 
        prevProjects.filter(p => p.project_id !== projectId)
      );
      
      setShowDeleteModal(false);
      showToast.success('Project deleted successfully!');
      } catch (error) {
      console.error('Failed to delete project:', error);
      showToast.error('Failed to delete project. Please try again.');
    }
  };

  const handleCreateProject = async (newProject) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/projects`, newProject);
      
      // Add the new project to local state
      setProjects(prevProjects => [...prevProjects, response.data]);
      
      setShowCreateModal(false);
      showToast.success('Project created successfully!');
    } catch (error) {
      console.error('Failed to create project:', error);
      showToast.error('Failed to create project. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PLANNED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'IN PROGRESS':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PLANNED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            <div className="min-w-0 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Project Management</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Manage projects, view forecasts, and track actual values</p>
            </div>
            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>
          </div>
        </div>
      </div>
          
      <div className="p-8 space-y-8">
        {/* View Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Projects Overview</h3>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 flex items-center gap-2 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Grid View
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`px-4 py-2 flex items-center gap-2 text-sm ${
                  viewMode === 'chart' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Chart View
              </button>
              </div>
            </div>
          </div>
          
        {/* Projects Grid/Chart */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.project_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{project.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.location}
                </p>
              </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)} flex items-center gap-1`}>
                    {getStatusIcon(project.status)}
                    {project.status}
            </div>
          </div>
          
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Tower Type</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.tower_type || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Substation Type</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.substation_type || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Project Size</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{project.project_size_km || 0} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Budget</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{(project.cost / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Start Date</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => generateForecast(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    Forecast
                  </button>
                  <button
                    onClick={() => openActualValuesModal(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Actual Values
                  </button>
            </div>
            
            {/* Month pills are not shown on cards; only inside modals */}
            
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => openEditModal(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit className="h-3 w-3" />
                    Edit Project
                  </button>
                  <button
                    onClick={() => openDeleteModal(project)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    Delete
                  </button>
                </div>
                
                <div className="mt-2">
                  <button
                    onClick={() => openTeamInviteModal(project)}
                    className="w-full px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex items-center justify-center gap-1"
                  >
                    <Building className="h-3 w-3" />
                    Invite Team Members
                  </button>
                </div>
          </div>
            ))}
        </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Budget Distribution</h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projects.map(project => ({
                  name: project.name.split(' ')[0],
                  budget: project.cost / 1000000, // Convert to millions
                  status: project.status
                }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: '600' }}
                    formatter={(value, name) => [`₹${value}M`, 'Budget']}
                  />
                  <Bar 
                    dataKey="budget" 
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
          </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">Project Budget Distribution</span>
                    </div>
                  </div>
        )}
                </div>

      {/* Forecast Modal */}
      {showForecastModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Forecast for {selectedProject.name}
              </h2>
              <p className="text-sm text-gray-500">View and manage forecast data for this project</p>
            </div>
            <button
              onClick={() => setShowForecastModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {projectForecasts[selectedProject?.project_id] && projectForecasts[selectedProject?.project_id].length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {(projectForecasts[selectedProject?.project_id] || [])
                .filter(f => f && f.predictions && Object.keys(f.predictions).length > 0)
                .map(f => f.forecast_month)
                .filter(Boolean)
                .map((m) => (
                  <button
                    key={m}
                    onClick={() => selectForecastMonth(m)}
                    className={`px-3 py-1 text-xs rounded-full border ${selectedForecastMonth === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  >
                    {formatMonth(m)}
                  </button>
                ))}
            </div>
          )}

            {forecastLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
                <p className="text-blue-600">Loading forecast data...</p>
              </div>
            ) : null}

            {/* Show informational message if there's forecast data but with a note */}
            {forecastError && forecastData && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">{forecastError}</p>
                </div>
              </div>
            )}

            {forecastData ? (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-end mb-3 gap-2">
                  <button
                    onClick={() => setChartView('tons')}
                    className={`px-3 py-1 text-xs rounded border ${chartView === 'tons' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  >Tons</button>
                  <button
                    onClick={() => setChartView('units')}
                    className={`px-3 py-1 text-xs rounded border ${chartView === 'units' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  >Units</button>
                        </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(forecastData)
                        .filter(([key]) => chartView === 'tons' ? key.includes('tons') : key.includes('count'))
                        .map(([key, qty]) => {
                          const unit = key.includes('tons') ? 'Tons' : 'Units';
                          const value = Number(qty);
                          return {
                            key,
                            name: key
                              .replace('quantity_', '')
                              .replace(/_/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase()),
                            value,
                            unit
                          };
                        })}
                      margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        interval={0}
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        angle={-30}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        tickFormatter={(v) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v))}
                        domain={[0, 'auto']}
                        allowDecimals
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value, _name, props) => {
                          const unit = props?.payload?.unit || '';
                          const num = Number(value);
                          if (unit === 'Units') {
                            if (num >= 1000) {
                              const k = (num / 1000).toFixed(1);
                              return [`${k}k ${unit}`, 'Quantity'];
                            }
                            return [`${Math.round(num)} ${unit}`, 'Quantity'];
                          }
                          const formatted = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
                          return [`${formatted} ${unit}`, 'Quantity'];
                        }}
                      />
                      <Bar dataKey={(d) => (d.unit === 'Units' ? Math.round(d.value) : d.value)} fill="#3b82f6" radius={[4, 4, 0, 0]} minPointSize={6} />
                    </BarChart>
                  </ResponsiveContainer>
                    </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 text-slate-600 px-8 py-12 rounded-xl text-center">
                <div className="text-slate-400 mb-6">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-slate-800 text-xl mb-3">No Forecast Data</h4>
                <p className="text-slate-600 mb-6 max-w-md mx-auto leading-relaxed">
                  No prediction available for this project. 
                  Generate a forecast to see material requirements and planning insights.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={redirectToForecasting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium transition-colors duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Generate Forecast
                  </button>
                  <button
                    onClick={() => setShowForecastModal(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Actual Values Modal */}
      {showActualValuesModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Material Actual Values - {selectedProject.name}
              </h2>
              <button
                onClick={() => setShowActualValuesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
                
            {(projectForecasts[selectedProject?.project_id] || []).length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {(projectForecasts[selectedProject?.project_id] || [])
                  .filter(f => f && f.predictions && Object.keys(f.predictions).length > 0)
                  .map(f => f.forecast_month)
                  .filter(Boolean)
                  .map((m) => (
                    <button
                      key={m}
                      onClick={() => selectForecastMonth(m)}
                      className={`px-3 py-1 text-xs rounded-full border ${selectedForecastMonth === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {formatMonth(m)}
                    </button>
                  ))}
              </div>
            )}

                {/* Sample Data Indicator */}
                {isSampleData && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium">
                        Showing generated actual values. Enter your real values and click Save to persist them.
                      </p>
                    </div>
                  </div>
                )}
        
        {!isSampleData && Object.keys(materialActualValues).length > 0 && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">
                Showing saved actual values. You can modify them and save again.
              </p>
            </div>
          </div>
        )}
                
            {/* Material Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {targetMaterials.map((material) => (
                <div key={material.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {material.name}
                  </label>
                  <div className="flex items-center">
                      <input
                        type="number"
                      value={materialActualValues[material.key] || ''}
                      onChange={(e) => handleMaterialValueChange(material.key, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      step="0.01"
                      disabled={loadingActuals}
                      />
                    <span className="ml-2 text-sm text-gray-500">{material.unit}</span>
                    </div>
                  </div>
              ))}
                    </div>
                    
            {/* Current Analysis */}
            {forecastData && materialActualValues && Object.keys(materialActualValues).length > 0 && (() => {
              const metrics = calculateMaterialMetrics(materialActualValues, forecastData);
              return (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Forecast vs Actual Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
                      <div className="text-sm text-green-700 mb-1 font-medium">Total Actual</div>
                      <div className="text-2xl font-bold text-green-800">{metrics.totalActual.toFixed(1)}</div>
                      <div className="text-xs text-green-600">units</div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
                      <div className="text-sm text-blue-700 mb-1 font-medium">Total Forecast</div>
                      <div className="text-2xl font-bold text-blue-800">{metrics.totalForecast.toFixed(1)}</div>
                      <div className="text-xs text-blue-600">units</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm">
                      <div className="text-sm text-purple-700 mb-1 font-medium">Accuracy</div>
                      <div className={`text-2xl font-bold ${
                        metrics.accuracyPercentage >= 95 ? 'text-green-600' :
                        metrics.accuracyPercentage >= 90 ? 'text-blue-600' :
                        metrics.accuracyPercentage >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metrics.accuracyPercentage}%
                      </div>
                      <div className="text-xs text-purple-600">{metrics.status}</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200 shadow-sm">
                      <div className="text-sm text-orange-700 mb-1 font-medium">Variance</div>
                      <div className={`text-2xl font-bold ${
                        metrics.variance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metrics.variance >= 0 ? '+' : ''}{metrics.variance.toFixed(1)}
                      </div>
                      <div className="text-xs text-orange-600">
                        {metrics.variancePercentage >= 0 ? '+' : ''}{metrics.variancePercentage}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Forecast vs Actual Chart with toggle (Tons/Units) */}
            {forecastData && (
              <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Forecast vs Actual by Material</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setChartView('tons')} className={`px-3 py-1 text-xs rounded border ${chartView === 'tons' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Tons</button>
                    <button onClick={() => setChartView('units')} className={`px-3 py-1 text-xs rounded border ${chartView === 'units' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>Units</button>
                      </div>
                </div>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={targetMaterials
                        .filter((m) => chartView === 'tons' ? m.unit === 'tons' : m.unit === 'units')
                        .map((m) => {
                          const isUnits = chartView !== 'tons';
                          const scale = isUnits ? 1000 : 1; // display in thousands for units to reduce squish
                          const f = Number(forecastData?.[m.key] || 0);
                          const a = Number(materialActualValues?.[m.key] || 0);
                          return {
                            name: m.name,
                            unit: isUnits ? 'Units' : 'Tons',
                            forecast: f / scale,
                            actual: a / scale,
                            originalForecast: f,
                            originalActual: a,
                            scale
                          };
                        })}
                      margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
                      barCategoryGap="20%"
                      barGap={4}
                      maxBarSize={48}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" interval={0} tick={{ fontSize: 12, fill: '#6b7280' }} angle={-30} textAnchor="end" height={60} />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        tickFormatter={(v) => chartView === 'units' ? Number(v).toFixed(1) : new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v))} 
                        domain={[0, 'auto']} 
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        formatter={(value, name, props) => {
                          const u = props?.payload?.unit || '';
                          if (u === 'Units') {
                            // show original values for clarity
                            const original = name === 'Forecast' ? props?.payload?.originalForecast : props?.payload?.originalActual;
                            const num = Number(original || 0);
                            const formatted = num >= 1000 ? `${(num/1000).toFixed(1)}k` : `${Math.round(num)}`;
                            return [`${formatted} ${u}`, name];
                          }
                          const num = Number(value);
                          const formatted = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
                          return [`${formatted} ${u}`, name];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey={(d) => (d.unit === 'Units' ? Math.round(d.forecast) : d.forecast)} name="Forecast" fill="#3b82f6" radius={[4,4,0,0]} minPointSize={6} />
                      <Bar dataKey={(d) => (d.unit === 'Units' ? Math.round(d.actual) : d.actual)} name="Actual" fill="#22c55e" radius={[4,4,0,0]} minPointSize={6} />
                    </BarChart>
                  </ResponsiveContainer>
                    </div>
                {chartView === 'units' && (
                  <div className="text-xs text-gray-500 mt-2">Note: Units displayed in thousands (1.0 = 1000 Units) for readability.</div>
                )}
                  </div>
            )}

            {/* Removed Entered Materials summary to avoid duplication with inputs above */}
                  
            <div className="flex gap-3">
                    <button
                onClick={() => setShowActualValuesModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                onClick={async () => {
                  try {
                    await saveMaterialActuals(selectedProject.project_id, materialActualValues);
                    showToast.success('Material values saved successfully!');
                    
                    // Trigger dashboard refresh
                    window.dispatchEvent(new CustomEvent('dashboardRefresh'));
                    console.log('Triggered dashboard refresh after saving actual values');
                    
                    setShowActualValuesModal(false);
                  } catch (error) {
                    console.error('Save error:', error);
                    const errorMessage = error.response?.data?.error || error.message || 'Failed to save material values. Please try again.';
                    showToast.error(errorMessage);
                  }
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                disabled={loadingActuals}
              >
                {loadingActuals ? 'Saving...' : 'Save Material Values'}
                    </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Project: {editingProject.name}
              </h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                ✕
                  </button>
                </div>
                
            <EditProjectForm 
              project={editingProject}
              onSave={handleEditProject}
              onCancel={() => setShowEditModal(false)}
                      />
                    </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Project
              </h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
                  </div>
                  
            <CreateProjectForm 
              onSave={handleCreateProject}
              onCancel={() => setShowCreateModal(false)}
                    />
                  </div>
                    </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Delete Project
              </h2>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
                  </div>
                  
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                    <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Are you sure you want to delete this project?
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This action cannot be undone.
                  </p>
                    </div>
                  </div>
                  
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{deletingProject.name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Project ID: {deletingProject.project_id}</div>
                  <div>Location: {deletingProject.location}</div>
                  <div>Status: {deletingProject.status}</div>
                  <div>Budget: ₹{(deletingProject.cost / 1000000).toFixed(1)}M</div>
                    </div>
                    </div>
                  </div>
                  
            <div className="flex gap-3">
                    <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                onClick={() => handleDeleteProject(deletingProject.project_id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                Delete Project
                    </button>
              </div>
            </div>
          </div>
        )}
        
      {/* Team Invitation Modal */}
      {showTeamInviteModal && invitingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Invite Team Members
              </h2>
              <button 
                onClick={closeTeamInviteModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {invitingProject.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Invite team members to collaborate on this project
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {error && (
                  <div className="text-red-600 text-sm">{error}</div>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeTeamInviteModal}
                disabled={inviteLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={sendTeamInvitation}
                disabled={inviteLoading}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-all"
              >
                {inviteLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
