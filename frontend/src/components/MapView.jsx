import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, CircleMarker } from 'react-leaflet';
import { 
  MapPin, Package, DollarSign, Calendar, AlertTriangle, 
  Filter, RefreshCw, Layers, Maximize2, Minimize2, Shield
} from 'lucide-react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { geocodeLocation, buildLocationString } from '../services/geocodingService';

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
  const [riskZones, setRiskZones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'All Status',
    towerType: 'All Tower Types',
    state: 'All States',
    riskLevel: 'All Risk Levels'
  });
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const [showRiskZones, setShowRiskZones] = useState(true);

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

  // Function to get coordinates using Geoapify geocoding API
  const getCoordinatesForLocation = async (state, city, specificLocation) => {
    try {
      // Build location string for geocoding - be very explicit about state
      let locationString;
      
      // Clean and normalize input
      const cleanState = state?.trim() || '';
      const cleanCity = city?.trim() || '';
      const cleanSpecific = specificLocation?.trim() || '';
      
      console.log('Input data:', { state: cleanState, city: cleanCity, specific: cleanSpecific });
      
      if (cleanCity && cleanState) {
        // Most accurate: City, State, India
        locationString = `${cleanCity}, ${cleanState}, India`;
      } else if (cleanState && cleanSpecific) {
        // Fallback: Specific location, State, India
        locationString = `${cleanSpecific}, ${cleanState}, India`;
      } else if (cleanState) {
        // Last resort: State capital or major city, State, India
        // This ensures we get a location within the correct state
        locationString = `${cleanState}, India`;
      } else {
        // Default fallback
        console.log('No location information provided, using India center');
        return { lat: 20.5937, lng: 78.9629 };
      }
      
      console.log(`Geocoding location: ${locationString}`);
      const coordinates = await geocodeLocation(locationString);
      
      console.log(`Successfully geocoded ${locationString}:`, coordinates);
      return coordinates;
      
    } catch (error) {
      console.error(`Failed to geocode location (${state}, ${city}, ${specificLocation}):`, error);
      // Return India center as fallback
      return { lat: 20.5937, lng: 78.9629 };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        // Fetch both projects and risk zones in parallel
        const [projectsResponse, riskZonesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/projects`, { headers }),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/row-risk/risk-zones`, { headers })
        ]);
        
        // Set risk zones
        setRiskZones(riskZonesResponse.data);
        console.log('Loaded risk zones:', riskZonesResponse.data);
        
        // Convert backend project data to map format with async geocoding
        const mapProjectsPromises = projectsResponse.data.map(async (project, index) => {
          console.log(`Processing project ${index + 1}:`, {
            name: project.name,
            state: project.state,
            city: project.city,
            location: project.location
          });
          
          // Generate coordinates based on state/city and specific location
          const coordinates = await getCoordinatesForLocation(project.state, project.city, project.location);
          
          const mappedProject = {
            id: String(project._id || project.project_id),
            name: project.name,
            location: project.city && project.state ? `${project.city}, ${project.state}` : project.location,
            state: project.state,
            city: project.city,
            status: project.status,
            type: project.tower_type || project.substation_type || 'Transmission Tower',
            tower_type: project.tower_type,
            substation_type: project.substation_type,
            lat: coordinates.lat,
            lng: coordinates.lng,
            budget: parseInt(project.cost) || 0,
            risk: "Medium" // Default risk level
          };
          
          console.log(`Mapped project coordinates:`, {
            name: mappedProject.name,
            lat: mappedProject.lat,
            lng: mappedProject.lng,
            hasState: !!mappedProject.state,
            hasCity: !!mappedProject.city
          });
          
          return mappedProject;
        });
        
        // Wait for all geocoding operations to complete
        const mapProjectsResults = await Promise.allSettled(mapProjectsPromises);
        
        // Filter successful results and projects with location data
        const mapProjects = mapProjectsResults
          .map((result, index) => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              console.error(`Failed to process project ${index + 1}:`, result.reason);
              return null;
            }
          })
          .filter(project => {
            if (!project) return false;
            // Only show projects that have both state and city
            const hasLocation = project.state && project.city;
            console.log(`Project ${project.name} location check:`, {
              state: project.state,
              city: project.city,
              hasLocation
            });
            return hasLocation;
          });
        
        setProjects(mapProjects);
        console.log('Loaded projects for map:', mapProjects);
      } catch (error) {
        console.error('Failed to load data:', error);
        // Fallback to sample data
        setProjects(sampleProjects);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getMarkerColor = (type) => {
    // Tower Type Colors
    if (type === 'Suspension') return '#3B82F6'; // Blue
    if (type === 'Tension') return '#10B981'; // Green
    if (type === 'Terminal') return '#F59E0B'; // Orange
    if (type === 'Transposition') return '#8B5CF6'; // Purple
    
    // Substation Type Colors (by voltage level)
    if (type === '132 kV AIS' || type === '132 kV GIS') return '#EF4444'; // Red
    if (type === '220 kV AIS' || type === '220 kV GIS') return '#F97316'; // Orange
    if (type === '400 kV AIS' || type === '400 kV GIS') return '#EAB308'; // Yellow
    if (type === '765 kV AIS' || type === '765 kV GIS') return '#84CC16'; // Lime
    if (type === 'HVDC') return '#06B6D4'; // Cyan
    
    // Fallback colors
    if (type === 'Transmission Tower') return '#3B82F6'; // Blue
    if (type === 'Substation') return '#10B981'; // Green
    if (type === 'Distribution') return '#F59E0B'; // Orange
    if (type === 'Renewable') return '#8B5CF6'; // Purple
    
    return '#6B7280'; // Gray default
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IN PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PLANNED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return '#ef4444'; // Red
      case 'Medium': return '#f59e0b'; // Orange
      case 'Low': return '#10b981'; // Green
      default: return '#6b7280'; // Gray
    }
  };

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return '🔴';
      case 'Medium': return '🟡';
      case 'Low': return '🟢';
      default: return '⚪';
    }
  };

  const getRiskZoneRadius = (riskLevel) => {
    switch (riskLevel) {
      case 'High': return 15000; // 15km radius
      case 'Medium': return 10000; // 10km radius
      case 'Low': return 5000; // 5km radius
      default: return 5000;
    }
  };

  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'All Status' && project.status !== filters.status) return false;
    if (filters.towerType !== 'All Tower Types' && project.tower_type !== filters.towerType) return false;
    if (filters.state !== 'All States' && project.state !== filters.state) return false;
    
    // Risk level filtering
    if (filters.riskLevel !== 'All Risk Levels') {
      // Find project in risk zones data
      const projectRisk = riskZones?.risk_zones?.high_risk?.find(p => p.project_id === project.id) ||
                         riskZones?.risk_zones?.medium_risk?.find(p => p.project_id === project.id) ||
                         riskZones?.risk_zones?.low_risk?.find(p => p.project_id === project.id);
      
      // Only show projects that have the selected risk level
      if (!projectRisk || projectRisk.risk_level !== filters.riskLevel) return false;
    }
    
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-8 py-6">
          <div className="flex flex-col items-start">
            <h1 className="text-3xl font-bold text-gray-900">Project Map</h1>
            <p className="text-gray-600 mt-2">Interactive map showing all PLANGRID projects across India.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Status</option>
              <option>IN PROGRESS</option>
              <option>COMPLETED</option>
              <option>PLANNED</option>
            </select>
            
            <select 
              value={filters.towerType}
              onChange={(e) => setFilters({...filters, towerType: e.target.value})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Tower Types</option>
              <option>Suspension</option>
              <option>Tension</option>
              <option>Terminal</option>
              <option>Transposition</option>
            </select>
            
            <select 
              value={filters.substationType}
              onChange={(e) => setFilters({...filters, substationType: e.target.value})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Substation Types</option>
              <option>132 kV AIS</option>
              <option>132 kV GIS</option>
              <option>220 kV AIS</option>
              <option>220 kV GIS</option>
              <option>400 kV AIS</option>
              <option>400 kV GIS</option>
              <option>765 kV AIS</option>
              <option>765 kV GIS</option>
              <option>HVDC</option>
            </select>
            
            <select 
              value={filters.state}
              onChange={(e) => setFilters({...filters, state: e.target.value})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All States</option>
              {[...new Set(projects.map(p => p.state).filter(Boolean))].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            
            <select 
              value={filters.riskLevel}
              onChange={(e) => setFilters({...filters, riskLevel: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Risk Levels</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            
            <button
              onClick={() => setShowRiskZones(!showRiskZones)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showRiskZones 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Shield className="h-4 w-4" />
              {showRiskZones ? 'Hide Risk Zones' : 'Show Risk Zones'}
            </button>
            
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Map */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
              <div className="h-[500px] lg:h-[980px]">
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
                  
                  {/* Risk Zones */}
                  {showRiskZones && riskZones && (
                    <>
                      {/* High Risk Zones */}
                      {riskZones.risk_zones?.high_risk?.map((zone) => (
                        <CircleMarker
                          key={`high-${zone.project_id}`}
                          center={[zone.coordinates.lat, zone.coordinates.lng]}
                          radius={20}
                          pathOptions={{
                            color: '#ef4444',
                            fillColor: '#ef4444',
                            fillOpacity: 0.2,
                            weight: 2
                          }}
                        >
                          <Tooltip>
                            <div className="text-sm">
                              <div className="font-semibold text-red-600">🔴 High Risk Zone</div>
                              <div>{zone.project_name}</div>
                              <div className="text-gray-600">Risk Score: {zone.risk_score}</div>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}
                      
                      {/* Medium Risk Zones */}
                      {riskZones.risk_zones?.medium_risk?.map((zone) => (
                        <CircleMarker
                          key={`medium-${zone.project_id}`}
                          center={[zone.coordinates.lat, zone.coordinates.lng]}
                          radius={15}
                          pathOptions={{
                            color: '#f59e0b',
                            fillColor: '#f59e0b',
                            fillOpacity: 0.2,
                            weight: 2
                          }}
                        >
                          <Tooltip>
                            <div className="text-sm">
                              <div className="font-semibold text-yellow-600">🟡 Medium Risk Zone</div>
                              <div>{zone.project_name}</div>
                              <div className="text-gray-600">Risk Score: {zone.risk_score}</div>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}
                      
                      {/* Low Risk Zones */}
                      {riskZones.risk_zones?.low_risk?.map((zone) => (
                        <CircleMarker
                          key={`low-${zone.project_id}`}
                          center={[zone.coordinates.lat, zone.coordinates.lng]}
                          radius={10}
                          pathOptions={{
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 0.2,
                            weight: 2
                          }}
                        >
                          <Tooltip>
                            <div className="text-sm">
                              <div className="font-semibold text-green-600">🟢 Low Risk Zone</div>
                              <div>{zone.project_name}</div>
                              <div className="text-gray-600">Risk Score: {zone.risk_score}</div>
                            </div>
                          </Tooltip>
                        </CircleMarker>
                      ))}
                    </>
                  )}

                  {/* Project Markers */}
                  {filteredProjects.map((project) => {
                    // Find project risk level
                    const projectRisk = riskZones?.risk_zones?.high_risk?.find(p => p.project_id === project.id) ||
                                       riskZones?.risk_zones?.medium_risk?.find(p => p.project_id === project.id) ||
                                       riskZones?.risk_zones?.low_risk?.find(p => p.project_id === project.id);
                    
                    return (
                      <Marker
                        key={project.id}
                        position={[project.lat, project.lng]}
                        icon={createCustomIcon(getMarkerColor(project.type))}
                      >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                          <div className="text-sm">
                            <div className="font-semibold">{project.name}</div>
                            <div className="text-gray-600">{project.location}</div>
                            {projectRisk && (
                              <div className="flex items-center gap-1 mt-1">
                                <span>{getRiskIcon(projectRisk.risk_level)}</span>
                                <span className={`text-xs font-medium ${
                                  projectRisk.risk_level === 'High' ? 'text-red-600' :
                                  projectRisk.risk_level === 'Medium' ? 'text-yellow-600' :
                                  'text-green-600'
                                }`}>
                                  {projectRisk.risk_level} Risk ({projectRisk.risk_score})
                                </span>
                              </div>
                            )}
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
                                <span>{project.tower_type || project.substation_type || project.type}</span>
                              </div>
                              {projectRisk && (
                                <div className="flex items-center">
                                  <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className={`text-xs font-medium ${
                                    projectRisk.risk_level === 'High' ? 'text-red-600' :
                                    projectRisk.risk_level === 'Medium' ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`}>
                                    RoW Risk: {projectRisk.risk_level} ({projectRisk.risk_score}/100)
                                  </span>
                                </div>
                              )}
                              {(project.tower_type || project.substation_type) && (
                                <div className="flex items-center">
                                  <Layers className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-xs text-gray-500">
                                    {project.tower_type ? `Tower: ${project.tower_type}` : `Substation: ${project.substation_type}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto">
            {/* Project Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Projects:</span>
                  <span className="text-sm font-semibold text-gray-900">{projects.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tower Projects:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {projects.filter(p => p.tower_type).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Substation Projects:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {projects.filter(p => p.substation_type).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {projects.filter(p => p.status === 'IN PROGRESS').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Completed:</span>
                  <span className="text-sm font-semibold text-green-600">
                    {projects.filter(p => p.status === 'COMPLETED').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Planned:</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {projects.filter(p => p.status === 'PLANNED').length}
                  </span>
                </div>
              </div>
            </div>

            {/* RoW Risk Statistics */}
            {riskZones && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">RoW Risk Statistics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">High Risk:</span>
                    <span className="text-sm font-semibold text-red-600">
                      {riskZones.summary?.high_risk_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Medium Risk:</span>
                    <span className="text-sm font-semibold text-yellow-600">
                      {riskZones.summary?.medium_risk_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Low Risk:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {riskZones.summary?.low_risk_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Assessed:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {riskZones.summary?.total_projects || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-98 ">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Map Legend</h3>
              
              {/* Risk Zones */}
              {showRiskZones && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-800 mb-3">RoW Risk Zones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">High Risk Zone</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Medium Risk Zone</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-600">Low Risk Zone</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tower Types */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Tower Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Suspension</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Tension</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Terminal</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Transposition</span>
                  </div>
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

