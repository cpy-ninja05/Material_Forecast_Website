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
    towerType: 'All Tower Types',
    substationType: 'All Substation Types',
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

  // Function to get coordinates based on state, city, and specific location
  const getCoordinatesForLocation = (state, city, specificLocation) => {
    // Real city coordinates mapping
    const cityCoordinates = {
      // Maharashtra cities
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Nagpur': { lat: 21.1458, lng: 79.0882 },
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Nashik': { lat: 19.9975, lng: 73.7898 },
      'Aurangabad': { lat: 19.8762, lng: 75.3433 },
      'Solapur': { lat: 17.6599, lng: 75.9064 },
      'Kolhapur': { lat: 16.7050, lng: 74.2433 },
      'Amravati': { lat: 20.9374, lng: 77.7796 },
      'Nanded': { lat: 19.1383, lng: 77.3210 },
      
      // Delhi cities
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'New Delhi': { lat: 28.6139, lng: 77.2090 },
      'Gurgaon': { lat: 28.4595, lng: 77.0266 },
      'Noida': { lat: 28.5355, lng: 77.3910 },
      'Faridabad': { lat: 28.4089, lng: 77.3178 },
      
      // Karnataka cities
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Mysore': { lat: 12.2958, lng: 76.6394 },
      'Hubli': { lat: 15.3173, lng: 75.7139 },
      'Mangalore': { lat: 12.9141, lng: 74.8560 },
      'Belgaum': { lat: 15.8497, lng: 74.4977 },
      'Gulbarga': { lat: 17.3297, lng: 76.8343 },
      'Davanagere': { lat: 14.4644, lng: 75.9218 },
      'Bellary': { lat: 15.1394, lng: 76.9214 },
      'Bijapur': { lat: 16.8240, lng: 75.7154 },
      'Shimoga': { lat: 13.9299, lng: 75.5681 },
      
      // Tamil Nadu cities
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Coimbatore': { lat: 11.0168, lng: 76.9558 },
      'Madurai': { lat: 9.9252, lng: 78.1198 },
      'Trichy': { lat: 10.7905, lng: 78.7047 },
      'Salem': { lat: 11.6643, lng: 78.1460 },
      'Tirunelveli': { lat: 8.7139, lng: 77.7567 },
      'Erode': { lat: 11.3410, lng: 77.7172 },
      'Vellore': { lat: 12.9202, lng: 79.1500 },
      'Thoothukudi': { lat: 8.7642, lng: 78.1348 },
      'Dindigul': { lat: 10.3456, lng: 77.9516 },
      
      // West Bengal cities
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Howrah': { lat: 22.5892, lng: 88.3103 },
      'Durgapur': { lat: 23.5204, lng: 87.3119 },
      'Asansol': { lat: 23.6739, lng: 86.9524 },
      'Siliguri': { lat: 26.7271, lng: 88.3953 },
      'Bardhaman': { lat: 23.2402, lng: 87.8694 },
      'Malda': { lat: 25.0118, lng: 88.1373 },
      'Baharampur': { lat: 24.1047, lng: 88.2515 },
      'Habra': { lat: 22.8304, lng: 88.6300 },
      'Kharagpur': { lat: 22.3149, lng: 87.3105 },
      
      // Gujarat cities
      'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'Surat': { lat: 21.1702, lng: 72.8311 },
      'Vadodara': { lat: 22.3072, lng: 73.1812 },
      'Rajkot': { lat: 22.3039, lng: 70.8022 },
      'Bhavnagar': { lat: 21.7645, lng: 72.1519 },
      'Jamnagar': { lat: 22.4707, lng: 70.0577 },
      'Junagadh': { lat: 21.5222, lng: 70.4579 },
      'Gandhinagar': { lat: 23.2156, lng: 72.6369 },
      'Nadiad': { lat: 22.6939, lng: 72.8616 },
      'Anand': { lat: 22.5645, lng: 72.9289 },
      
      // Rajasthan cities
      'Jaipur': { lat: 26.9124, lng: 75.7873 },
      'Jodhpur': { lat: 26.2389, lng: 73.0243 },
      'Udaipur': { lat: 24.5854, lng: 73.7123 },
      'Kota': { lat: 25.2138, lng: 75.8648 },
      'Bikaner': { lat: 28.0229, lng: 73.3119 },
      'Ajmer': { lat: 26.4499, lng: 74.6399 },
      'Bharatpur': { lat: 27.1767, lng: 77.6961 },
      'Alwar': { lat: 27.5618, lng: 76.6081 },
      'Sikar': { lat: 27.6119, lng: 75.1397 },
      'Pali': { lat: 25.7713, lng: 73.3237 },
      
      // Uttar Pradesh cities
      'Lucknow': { lat: 26.8467, lng: 80.9462 },
      'Kanpur': { lat: 26.4499, lng: 80.3319 },
      'Agra': { lat: 27.1767, lng: 78.0081 },
      'Varanasi': { lat: 25.3176, lng: 82.9739 },
      'Meerut': { lat: 28.9845, lng: 77.7064 },
      'Allahabad': { lat: 25.4358, lng: 81.8463 },
      'Bareilly': { lat: 28.3670, lng: 79.4304 },
      'Aligarh': { lat: 27.8974, lng: 78.0880 },
      'Moradabad': { lat: 28.8388, lng: 78.7738 },
      'Saharanpur': { lat: 29.9670, lng: 77.5451 },
      
      // Bihar cities
      'Patna': { lat: 25.5941, lng: 85.1376 },
      'Gaya': { lat: 24.7950, lng: 85.0000 },
      'Bhagalpur': { lat: 25.2445, lng: 86.9718 },
      'Muzaffarpur': { lat: 26.1209, lng: 85.3647 },
      'Darbhanga': { lat: 26.1667, lng: 85.9000 },
      'Purnia': { lat: 25.7781, lng: 87.4742 },
      'Arrah': { lat: 25.5560, lng: 84.6624 },
      'Begusarai': { lat: 25.4180, lng: 86.1289 },
      'Katihar': { lat: 25.5400, lng: 87.5700 },
      'Chhapra': { lat: 25.7800, lng: 84.7500 },
      
      // Punjab cities
      'Chandigarh': { lat: 30.7333, lng: 76.7794 },
      'Ludhiana': { lat: 30.9010, lng: 75.8573 },
      'Amritsar': { lat: 31.6340, lng: 74.8723 },
      'Jalandhar': { lat: 31.3260, lng: 75.5762 },
      'Patiala': { lat: 30.3398, lng: 76.3869 },
      'Bathinda': { lat: 30.2070, lng: 74.9483 },
      'Mohali': { lat: 30.7046, lng: 76.7179 },
      'Firozpur': { lat: 30.9257, lng: 74.6131 },
      'Batala': { lat: 31.8186, lng: 75.2027 },
      'Moga': { lat: 30.8158, lng: 75.1689 },
      
      // Haryana cities
      'Faridabad': { lat: 28.4089, lng: 77.3178 },
      'Gurgaon': { lat: 28.4595, lng: 77.0266 },
      'Panipat': { lat: 29.3909, lng: 76.9635 },
      'Ambala': { lat: 30.3753, lng: 76.7821 },
      'Yamunanagar': { lat: 30.1290, lng: 77.2670 },
      'Rohtak': { lat: 28.8955, lng: 76.6066 },
      'Hisar': { lat: 29.1492, lng: 75.7217 },
      'Karnal': { lat: 29.6857, lng: 76.9905 },
      'Sonipat': { lat: 28.9931, lng: 77.0151 },
      'Panchkula': { lat: 30.6942, lng: 76.8606 },
      
      // Additional Major Cities
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Vijayawada': { lat: 16.5062, lng: 80.6480 },
      'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
      'Tirupati': { lat: 13.6288, lng: 79.4192 },
      'Warangal': { lat: 17.9689, lng: 79.5941 },
      'Guntur': { lat: 16.3067, lng: 80.4365 },
      'Rajahmundry': { lat: 17.0005, lng: 81.8040 },
      'Kadapa': { lat: 14.4753, lng: 78.8298 },
      'Kurnool': { lat: 15.8309, lng: 78.0422 },
      'Nellore': { lat: 14.4426, lng: 79.9865 },
      
      // Kerala cities
      'Thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
      'Kochi': { lat: 9.9312, lng: 76.2673 },
      'Kozhikode': { lat: 11.2588, lng: 75.7804 },
      'Thrissur': { lat: 10.8505, lng: 76.2711 },
      'Kollam': { lat: 8.8932, lng: 76.6141 },
      'Palakkad': { lat: 10.7867, lng: 76.6548 },
      'Malappuram': { lat: 11.0404, lng: 76.0819 },
      'Kannur': { lat: 11.8745, lng: 75.3704 },
      'Kasaragod': { lat: 12.4984, lng: 74.9899 },
      'Alappuzha': { lat: 9.4981, lng: 76.3388 },
      
      // Odisha cities
      'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
      'Cuttack': { lat: 20.4625, lng: 85.8820 },
      'Rourkela': { lat: 22.2604, lng: 84.8536 },
      'Berhampur': { lat: 19.3142, lng: 84.7941 },
      'Sambalpur': { lat: 21.4704, lng: 83.9701 },
      'Puri': { lat: 19.8134, lng: 85.8315 },
      'Balasore': { lat: 21.4945, lng: 86.9336 },
      'Bhadrak': { lat: 21.0550, lng: 86.5000 },
      'Baripada': { lat: 21.9333, lng: 86.7333 },
      'Jharsuguda': { lat: 21.8500, lng: 84.0333 },
      
      // Assam cities
      'Guwahati': { lat: 26.1445, lng: 91.7362 },
      'Silchar': { lat: 24.8167, lng: 92.8000 },
      'Dibrugarh': { lat: 27.4833, lng: 94.9000 },
      'Jorhat': { lat: 26.7500, lng: 94.2167 },
      'Nagaon': { lat: 26.3500, lng: 92.6833 },
      'Tinsukia': { lat: 27.4833, lng: 95.3667 },
      'Tezpur': { lat: 26.6333, lng: 92.8000 },
      'Barpeta': { lat: 26.3167, lng: 91.0167 },
      'Goalpara': { lat: 26.1667, lng: 90.6167 },
      'Karimganj': { lat: 24.8667, lng: 92.3500 },
      
      // Madhya Pradesh cities
      'Bhopal': { lat: 23.1815, lng: 77.4344 },
      'Indore': { lat: 22.7196, lng: 75.8577 },
      'Gwalior': { lat: 26.2183, lng: 78.1828 },
      'Jabalpur': { lat: 23.1815, lng: 79.9864 },
      'Ujjain': { lat: 23.1765, lng: 75.7885 },
      'Sagar': { lat: 23.8333, lng: 78.7167 },
      'Dewas': { lat: 22.9667, lng: 76.0667 },
      'Satna': { lat: 24.5833, lng: 80.8333 },
      'Ratlam': { lat: 23.3167, lng: 75.0667 },
      'Rewa': { lat: 24.5333, lng: 81.3000 },
      
      // Jharkhand cities
      'Ranchi': { lat: 23.3441, lng: 85.3096 },
      'Jamshedpur': { lat: 22.8046, lng: 86.2029 },
      'Dhanbad': { lat: 23.7957, lng: 86.4304 },
      'Bokaro': { lat: 23.6693, lng: 85.9786 },
      'Deoghar': { lat: 24.4833, lng: 86.7000 },
      'Phusro': { lat: 23.7833, lng: 85.9000 },
      'Hazaribagh': { lat: 23.9833, lng: 85.3500 },
      'Giridih': { lat: 24.1833, lng: 86.3000 },
      'Ramgarh': { lat: 23.6333, lng: 85.5167 },
      'Medininagar': { lat: 24.4333, lng: 84.1333 },
      
      // Chhattisgarh cities
      'Raipur': { lat: 21.2514, lng: 81.6296 },
      'Bhilai': { lat: 21.2167, lng: 81.4333 },
      'Bilaspur': { lat: 22.0833, lng: 82.1500 },
      'Korba': { lat: 22.3500, lng: 82.6833 },
      'Rajnandgaon': { lat: 21.1000, lng: 81.0333 },
      'Raigarh': { lat: 21.9000, lng: 83.4000 },
      'Jagdalpur': { lat: 19.0833, lng: 82.0333 },
      'Ambikapur': { lat: 23.1167, lng: 83.2000 },
      'Durg': { lat: 21.1833, lng: 81.2833 },
      'Bhatapara': { lat: 21.7333, lng: 81.9500 }
    };
    
    // Try to find coordinates by city name first (most accurate)
    if (city && cityCoordinates[city]) {
      console.log(`Found city coordinates for ${city}:`, cityCoordinates[city]);
      return cityCoordinates[city];
    }
    
    // Fallback: Try to find by state and specific location
    const locationMap = {
      'Maharashtra': { 
        'Central': { lat: 19.0760, lng: 72.8777 }, // Mumbai
        'North': { lat: 20.9374, lng: 77.7796 }, // Nagpur
        'South': { lat: 18.5204, lng: 73.8567 }, // Pune
        'East': { lat: 19.2183, lng: 72.9781 }, // Thane
        'West': { lat: 19.0330, lng: 72.8570 } // Mumbai West
      },
      'Delhi': { 
        'Central': { lat: 28.7041, lng: 77.1025 }, // Delhi
        'North': { lat: 28.7041, lng: 77.1025 }, // North Delhi
        'South': { lat: 28.4595, lng: 77.0266 }, // South Delhi
        'East': { lat: 28.7041, lng: 77.1025 }, // East Delhi
        'West': { lat: 28.7041, lng: 77.1025 } // West Delhi
      },
      'Karnataka': { 
        'Central': { lat: 12.9716, lng: 77.5946 }, // Bangalore
        'North': { lat: 15.3173, lng: 75.7139 }, // Hubli
        'South': { lat: 12.2958, lng: 76.6394 }, // Mysore
        'East': { lat: 12.2958, lng: 76.6394 }, // Eastern Karnataka
        'West': { lat: 14.5204, lng: 74.8567 } // Western Karnataka
      },
      'Tamil Nadu': { 
        'Central': { lat: 13.0827, lng: 80.2707 }, // Chennai
        'North': { lat: 11.0168, lng: 76.9558 }, // Coimbatore
        'South': { lat: 8.0883, lng: 77.5385 }, // Kanyakumari
        'East': { lat: 10.7905, lng: 78.7047 }, // Trichy
        'West': { lat: 9.9252, lng: 78.1198 } // Madurai
      },
      'West Bengal': { 
        'Central': { lat: 22.5726, lng: 88.3639 }, // Kolkata
        'North': { lat: 26.7167, lng: 88.4167 }, // Darjeeling
        'South': { lat: 22.5726, lng: 88.3639 }, // South Kolkata
        'East': { lat: 22.5726, lng: 88.3639 }, // East Kolkata
        'West': { lat: 22.5726, lng: 88.3639 } // West Kolkata
      },
      'Gujarat': { 
        'Central': { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
        'North': { lat: 24.5854, lng: 72.7123 }, // North Gujarat
        'South': { lat: 21.1702, lng: 72.8311 }, // Surat
        'East': { lat: 23.0225, lng: 72.5714 }, // East Gujarat
        'West': { lat: 22.3039, lng: 70.8022 } // West Gujarat
      },
      'Rajasthan': { 
        'Central': { lat: 26.9124, lng: 75.7873 }, // Jaipur
        'North': { lat: 29.9457, lng: 73.1123 }, // North Rajasthan
        'South': { lat: 24.5854, lng: 73.7123 }, // South Rajasthan
        'East': { lat: 26.9124, lng: 75.7873 }, // East Rajasthan
        'West': { lat: 26.2389, lng: 73.0243 } // West Rajasthan
      },
      'Uttar Pradesh': { 
        'Central': { lat: 26.8467, lng: 80.9462 }, // Lucknow
        'North': { lat: 28.4595, lng: 77.0266 }, // North UP
        'South': { lat: 25.3176, lng: 82.9739 }, // Varanasi
        'East': { lat: 26.8467, lng: 80.9462 }, // East UP
        'West': { lat: 26.8467, lng: 80.9462 } // West UP
      },
      'Bihar': {
        'Central': { lat: 25.5941, lng: 85.1376 }, // Patna
        'North': { lat: 26.8467, lng: 85.1376 }, // North Bihar
        'South': { lat: 24.5854, lng: 85.1376 }, // South Bihar
        'East': { lat: 25.5941, lng: 87.1376 }, // East Bihar
        'West': { lat: 25.5941, lng: 83.1376 } // West Bihar
      },
      'Punjab': {
        'Central': { lat: 31.1471, lng: 75.3412 }, // Ludhiana
        'North': { lat: 32.1471, lng: 75.3412 }, // North Punjab
        'South': { lat: 30.1471, lng: 75.3412 }, // South Punjab
        'East': { lat: 31.1471, lng: 76.3412 }, // East Punjab
        'West': { lat: 31.1471, lng: 74.3412 } // West Punjab
      },
      'Haryana': {
        'Central': { lat: 28.4595, lng: 77.0266 }, // Gurgaon
        'North': { lat: 29.4595, lng: 77.0266 }, // North Haryana
        'South': { lat: 27.4595, lng: 77.0266 }, // South Haryana
        'East': { lat: 28.4595, lng: 78.0266 }, // East Haryana
        'West': { lat: 28.4595, lng: 76.0266 } // West Haryana
      }
    };
    
    if (state && specificLocation && locationMap[state] && locationMap[state][specificLocation]) {
      console.log(`Found state-specific coordinates for ${state} - ${specificLocation}:`, locationMap[state][specificLocation]);
      return locationMap[state][specificLocation];
    }
    
    // Fallback to state center if specific location not found
    if (state && locationMap[state] && locationMap[state]['Central']) {
      console.log(`Using Central coordinates for ${state}:`, locationMap[state]['Central']);
      return locationMap[state]['Central'];
    }
    
    // Default to India center if state not found
    console.log(`Using default India center coordinates for ${state || 'unknown state'}`);
    return { lat: 20.5937, lng: 78.9629 };
  };

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/projects', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        // Convert backend project data to map format
        const mapProjects = response.data.map((project, index) => {
          console.log(`Processing project ${index + 1}:`, {
            name: project.name,
            state: project.state,
            city: project.city,
            location: project.location
          });
          
          // Generate coordinates based on state/city and specific location
          const coordinates = getCoordinatesForLocation(project.state, project.city, project.location);
          
          const mappedProject = {
            id: project._id || project.project_id,
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
        }).filter(project => {
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
        console.error('Failed to load projects:', error);
        // Fallback to sample data
        setProjects(sampleProjects);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
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

  const filteredProjects = projects.filter(project => {
    if (filters.status !== 'All Status' && project.status !== filters.status) return false;
    if (filters.towerType !== 'All Tower Types' && project.tower_type !== filters.towerType) return false;
    if (filters.substationType !== 'All Substation Types' && project.substation_type !== filters.substationType) return false;
    if (filters.state !== 'All States' && project.state !== filters.state) return false;
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Project Map</h1>
          <p className="text-gray-600 mt-2">Interactive map showing all PLANGRID projects across India.</p>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-hidden">
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
              value={filters.towerType}
              onChange={(e) => setFilters({...filters, towerType: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All States</option>
              {[...new Set(projects.map(p => p.state).filter(Boolean))].map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            
            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 min-h-0">
          {/* Map */}
          <div className="lg:col-span-3 flex flex-col min-h-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
              <div className="flex-1 min-h-[400px] lg:min-h-0">
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
                              <span>{project.tower_type || project.substation_type || project.type}</span>
                            </div>
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
                  ))}
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

            {/* Map Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Map Legend</h3>
              
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

              {/* Substation Types */}
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-3">Substation Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">132 kV (AIS/GIS)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">220 kV (AIS/GIS)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">400 kV (AIS/GIS)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-lime-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">765 kV (AIS/GIS)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-cyan-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">HVDC</span>
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

