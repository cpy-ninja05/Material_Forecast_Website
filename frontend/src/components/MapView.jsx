import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { 
  MapPin, Package, DollarSign, Calendar, AlertTriangle, 
  Filter, RefreshCw, Layers, Maximize2, Minimize2
} from 'lucide-react';
import axios from 'axios';
import FilterSidebar from './ui/FilterSidebar';
import MetricCard from './ui/MetricCard';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const MapView = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: 'all',
    towerType: 'all',
    substationType: 'all',
    riskLevel: 'all',
    dateRange: 'all',
    materialType: 'all'
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewMode, setViewMode] = useState('projects'); // projects, materials, budget
  const [showProjects, setShowProjects] = useState(true);

  // Projects will be loaded from backend /api/analytics/map-data

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const fetchProjectsData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/analytics/map-data');
      // Normalize: backend returns id (project_id), name, location, lat, lng, budget, risk, size, tower_type, substation_type, materials
      const normalized = response.data.map(p => ({
        id: p.id,
        name: p.name,
        location: p.location,
        lat: p.lat,
        lng: p.lng,
        budget: p.budget,
        risk: typeof p.risk === 'string' ? p.risk : String(p.risk),
        materials: Array.isArray(p.materials) ? p.materials : []
      }));
      setProjects(normalized);
    } catch (error) {
      console.error('Error fetching projects data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    // Filter projects based on new filters
    const filteredProjects = projects.filter(project => {
      if (newFilters.location !== 'all' && project.location !== newFilters.location) return false;
      if (newFilters.riskLevel !== 'all' && project.risk !== newFilters.riskLevel) return false;
      return true;
    });
    setProjects(filteredProjects);
  };

  const getMarkerColor = (risk) => {
    switch (risk) {
      case 'Low': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'High': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'Low': return '🟢';
      case 'Medium': return '🟡';
      case 'High': return '🔴';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <MapPin className="h-8 w-8 mr-3 text-indigo-600" />
                Project Map View
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Interactive map showing POWERGRID projects across India
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('projects')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'projects'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setViewMode('materials')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'materials'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Materials
                </button>
                <button
                  onClick={() => setViewMode('budget')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'budget'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Budget
                </button>
              </div>

              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={fetchProjectsData}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <div className="flex items-center ml-2 text-sm text-gray-600 dark:text-gray-300">
                <input id="layer-projects" type="checkbox" className="mr-2" checked={showProjects} onChange={()=>setShowProjects(v=>!v)} />
                <label htmlFor="layer-projects">Projects layer</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard
            title="Total Projects"
            value={projects.length}
            change={8}
            changeType="positive"
            icon={MapPin}
            suffix=" projects"
          />
          <MetricCard
            title="Total Budget"
            value={projects.reduce((sum, project) => sum + project.budget, 0) / 10000000}
            change={12}
            changeType="positive"
            icon={DollarSign}
            prefix="₹"
            suffix="Cr"
          />
          <MetricCard
            title="High Risk"
            value={projects.filter(p => p.risk === 'High').length}
            change={-2}
            changeType="negative"
            icon={AlertTriangle}
            suffix=" projects"
          />
          <MetricCard
            title="Regions"
            value={new Set(projects.map(p => p.location)).size}
            change={0}
            changeType="neutral"
            icon={Layers}
            suffix=" regions"
          />
        </div>

        {/* Map Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Project Locations Map
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Click on markers to view project details
            </p>
          </div>
          
          <div className="h-96 md:h-[500px] lg:h-[600px]">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {showProjects && projects.map((project) => (
                <Marker
                  key={project.id}
                  position={[project.lat, project.lng]}
                  icon={createCustomIcon(getMarkerColor(project.risk))}
                  eventHandlers={{
                    click: () => setSelectedProject(project)
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <div className="text-sm">
                      <div className="font-semibold">{project.name}</div>
                      <div className="text-gray-600">{project.location} Region</div>
                    </div>
                  </Tooltip>
                  
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{project.location} Region</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                          <span>₹{(project.budget / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                            project.risk === 'Low' 
                              ? 'bg-green-100 text-green-800'
                              : project.risk === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getRiskIcon(project.risk)} {project.risk} Risk
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{project.materials.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Project Details Panel */}
        {selectedProject && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Project Details
              </h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-300">Project ID</h4>
                <p className="text-2xl font-bold text-blue-800 dark:text-blue-400">{selectedProject.id}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-300">Budget</h4>
                <p className="text-2xl font-bold text-green-800 dark:text-green-400">
                  ₹{(selectedProject.budget / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-300">Risk Level</h4>
                <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-400">
                  {getRiskIcon(selectedProject.risk)} {selectedProject.risk}
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <h4 className="font-medium text-purple-900 dark:text-purple-300">Materials</h4>
                <p className="text-sm text-purple-800 dark:text-purple-400">
                  {selectedProject.materials.join(', ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Map Legend
          </h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Low Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Medium Risk</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onApplyFilters={handleApplyFilters}
        filters={filters}
        setFilters={setFilters}
      />
    </div>
  );
};

export default MapView;

