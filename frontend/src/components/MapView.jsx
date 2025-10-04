import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { 
  MapPin, Package, DollarSign, Calendar, AlertTriangle, 
  Filter, RefreshCw, Layers, Maximize2, Minimize2
} from 'lucide-react';
import axios from 'axios';
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
    status: 'All Status',
    type: 'All Types',
    state: 'All States'
  });
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);

  // Sample project data matching the image
  const sampleProjects = [
    {
      id: 1,
      name: "Mumbai-Pune Transmission Line",
      location: "Mumbai, Maharashtra",
      status: "IN PROGRESS",
      type: "Transmission Tower",
      lat: 19.0760,
      lng: 72.8777,
      budget: 500000000,
      risk: "Medium"
    },
    {
      id: 2,
      name: "Delhi Grid Substation",
      location: "Delhi, NCR",
      status: "PLANNED",
      type: "Substation",
      lat: 28.7041,
      lng: 77.1025,
      budget: 350000000,
      risk: "Low"
    },
    {
      id: 3,
      name: "Bangalore Ring Road Transmission",
      location: "Bangalore, Karnataka",
      status: "IN PROGRESS",
      type: "Transmission Tower",
      lat: 12.9716,
      lng: 77.5946,
      budget: 420000000,
      risk: "Medium"
    },
    {
      id: 4,
      name: "Chennai Power Grid",
      location: "Chennai, Tamil Nadu",
      status: "COMPLETED",
      type: "Substation",
      lat: 13.0827,
      lng: 80.2707,
      budget: 280000000,
      risk: "Low"
    },
    {
      id: 5,
      name: "Kolkata Distribution Network",
      location: "Kolkata, West Bengal",
      status: "IN PROGRESS",
      type: "Transmission Tower",
      lat: 22.5726,
      lng: 88.3639,
      budget: 390000000,
      risk: "High"
    },
    {
      id: 6,
      name: "Ahmedabad Power Station",
      location: "Ahmedabad, Gujarat",
      status: "PLANNED",
      type: "Substation",
      lat: 23.0225,
      lng: 72.5714,
      budget: 320000000,
      risk: "Medium"
    }
  ];

  useEffect(() => {
    setProjects(sampleProjects);
    setLoading(false);
  }, []);

  const getMarkerColor = (type) => {
    switch (type) {
      case 'Transmission Tower': return '#3B82F6'; // Blue
      case 'Substation': return '#10B981'; // Green
      default: return '#6B7280'; // Gray
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PLANNED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'All Status' && project.status !== filters.status) return false;
    if (filters.type !== 'All Types' && project.type !== filters.type) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Project Map</h1>
          <p className="text-gray-600 mt-2">Interactive map showing all POWERGRID projects across India.</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Status</option>
              <option>IN PROGRESS</option>
              <option>COMPLETED</option>
              <option>PLANNED</option>
            </select>
            
            <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Types</option>
              <option>Transmission Tower</option>
              <option>Substation</option>
            </select>
            
            <select 
              value={filters.state}
              onChange={(e) => setFilters({...filters, state: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All States</option>
              <option>Maharashtra</option>
              <option>Delhi</option>
              <option>Karnataka</option>
              <option>Tamil Nadu</option>
              <option>West Bengal</option>
              <option>Gujarat</option>
            </select>
            
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-[600px]">
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
                  
                  {filteredProjects.map((project) => (
                    <Marker
                      key={project.id}
                      position={[project.lat, project.lng]}
                      icon={createCustomIcon(getMarkerColor(project.type))}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                        <div className="text-sm">
                          <div className="font-semibold">{project.name}</div>
                          <div className="text-gray-600">{project.location}</div>
                        </div>
                      </Tooltip>
                      
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{project.location}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                              <span>₹{(project.budget / 1000000).toFixed(1)}M</span>
                            </div>
                            <div className="flex items-center">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                {project.status}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{project.type}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Projects:</span>
                  <span className="text-sm font-semibold text-gray-900">6</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transmission Towers:</span>
                  <span className="text-sm font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Substations:</span>
                  <span className="text-sm font-semibold text-gray-900">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <span className="text-sm font-semibold text-blue-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="text-sm font-semibold text-green-600">1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Planned:</span>
                  <span className="text-sm font-semibold text-orange-600">2</span>
                </div>
              </div>
            </div>

            {/* Map Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Map Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Transmission Tower</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm text-gray-600">Substation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;

