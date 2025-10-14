import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Star,
  FileText,
  Download,
  Eye,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  Building,
  Award,
  Target,
  Users,
  Package
} from 'lucide-react';

const SupplierDashboard = () => {
  const [supplier, setSupplier] = useState(null);
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [performance, setPerformance] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch the current supplier's data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/supplier/dashboard`);
      if (response.ok) {
        const data = await response.json();
        setSupplier(data.supplier);
        setAssignedProjects(data.projects);
        setPerformance(data.performance);
        setNotifications(data.notifications);
      } else {
        // Fallback to mock data
        setSupplier(generateMockSupplier());
        setAssignedProjects(generateMockProjects());
        setPerformance(generateMockPerformance());
        setNotifications(generateMockNotifications());
      }
    } catch (error) {
      console.error('Error fetching supplier data:', error);
      setSupplier(generateMockSupplier());
      setAssignedProjects(generateMockProjects());
      setPerformance(generateMockPerformance());
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };

  const generateMockSupplier = () => ({
    id: 'SUP-001',
    companyName: 'Global Steel Corp',
    contactName: 'John Smith',
    email: 'john@globalsteel.com',
    phone: '+1-555-0123',
    category: 'Steel & Metal',
    specialties: ['Structural Steel', 'Reinforcement Bars', 'Steel Plates'],
    status: 'Active',
    rating: 4.8,
    projectsCompleted: 45,
    totalValue: 2500000,
    joinedDate: new Date('2022-01-15'),
    certifications: ['ISO 9001', 'ISO 14001', 'AWS D1.1'],
    address: '123 Industrial Blvd, Manufacturing City, MC 12345'
  });

  const generateMockProjects = () => [
    {
      id: 'PROJ-001',
      name: 'Metropolitan Monopole Project',
      status: 'In Progress',
      role: 'Primary Supplier',
      budget: 150000,
      actualCost: 120000,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-06-30'),
      progress: 75,
      materials: ['Structural Steel', 'Foundation Bolts'],
      location: 'Central - New York',
      priority: 'High'
    },
    {
      id: 'PROJ-002',
      name: 'West Coast Self-Support',
      status: 'Completed',
      role: 'Primary Supplier',
      budget: 200000,
      actualCost: 195000,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-05-30'),
      progress: 100,
      materials: ['Steel Poles', 'Reinforcement Bars'],
      location: 'West - Los Angeles',
      priority: 'Medium'
    },
    {
      id: 'PROJ-003',
      name: 'Eastern Guyed Tower',
      status: 'Planning',
      role: 'Secondary Supplier',
      budget: 100000,
      actualCost: 0,
      startDate: new Date('2024-03-15'),
      endDate: new Date('2024-08-30'),
      progress: 0,
      materials: ['Steel Plates', 'Structural Steel'],
      location: 'East - Boston',
      priority: 'Low'
    }
  ];

  const generateMockPerformance = () => ({
    onTimeDelivery: 95,
    qualityRating: 4.8,
    budgetAdherence: 92,
    customerSatisfaction: 4.7,
    totalDeliveries: 156,
    onTimeDeliveries: 148,
    averageDeliveryTime: 3.2,
    monthlyRevenue: [120000, 135000, 150000, 165000, 180000, 195000],
    monthlyProjects: [3, 4, 5, 6, 7, 8]
  });

  const generateMockNotifications = () => [
    {
      id: 1,
      type: 'project',
      title: 'New Project Assignment',
      message: 'You have been assigned to Metropolitan Monopole Project',
      timestamp: new Date('2024-01-15T10:30:00'),
      read: false
    },
    {
      id: 2,
      type: 'delivery',
      title: 'Delivery Scheduled',
      message: 'Delivery for West Coast Self-Support scheduled for tomorrow',
      timestamp: new Date('2024-01-14T14:20:00'),
      read: true
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Received',
      message: 'Payment of $45,000 received for completed project',
      timestamp: new Date('2024-01-13T09:15:00'),
      read: true
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'Low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{supplier.companyName}</h1>
                <p className="text-sm text-gray-500">Supplier Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-5 w-5 text-gray-400" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </div>
              <Settings className="h-5 w-5 text-gray-400" />
              <LogOut className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedProjects.filter(p => p.status === 'In Progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignedProjects.filter(p => p.status === 'Completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">{supplier.rating}/5</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${supplier.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'projects', name: 'My Projects', icon: Package },
                { id: 'performance', name: 'Performance', icon: TrendingUp },
                { id: 'notifications', name: 'Notifications', icon: Bell }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Metrics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">On-Time Delivery</span>
                        <span className="text-sm font-medium text-gray-900">{performance.onTimeDelivery}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${performance.onTimeDelivery}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quality Rating</span>
                        <span className="text-sm font-medium text-gray-900">{performance.qualityRating}/5</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(performance.qualityRating / 5) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Budget Adherence</span>
                        <span className="text-sm font-medium text-gray-900">{performance.budgetAdherence}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${performance.budgetAdherence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map((notification) => (
                        <div key={notification.id} className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            notification.type === 'project' ? 'bg-blue-100' :
                            notification.type === 'delivery' ? 'bg-green-100' :
                            'bg-yellow-100'
                          }`}>
                            {notification.type === 'project' && <Package className="h-3 w-3 text-blue-600" />}
                            {notification.type === 'delivery' && <CheckCircle className="h-3 w-3 text-green-600" />}
                            {notification.type === 'payment' && <DollarSign className="h-3 w-3 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500">{notification.message}</p>
                            <p className="text-xs text-gray-400">{notification.timestamp.toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    {performance.monthlyRevenue.map((revenue, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="bg-blue-500 rounded-t w-8 mb-2"
                          style={{ height: `${(revenue / 200000) * 200}px` }}
                        ></div>
                        <span className="text-xs text-gray-500">${(revenue / 1000).toFixed(0)}k</span>
                        <span className="text-xs text-gray-400">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Assigned Projects</h3>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignedProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{project.name}</div>
                              <div className="text-sm text-gray-500">{project.location}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {project.role}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-500">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${project.budget.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <MessageCircle className="h-4 w-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <FileText className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Performance Tab */}
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Deliveries</span>
                        <span className="text-sm font-medium">{performance.totalDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">On-Time Deliveries</span>
                        <span className="text-sm font-medium">{performance.onTimeDeliveries}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average Delivery Time</span>
                        <span className="text-sm font-medium">{performance.averageDeliveryTime} days</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Quality Rating</span>
                        <span className="text-sm font-medium">{performance.qualityRating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Customer Satisfaction</span>
                        <span className="text-sm font-medium">{performance.customerSatisfaction}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Budget Adherence</span>
                        <span className="text-sm font-medium">{performance.budgetAdherence}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications & Compliance</h3>
                  <div className="flex flex-wrap gap-2">
                    {supplier.certifications.map((cert, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <Award className="h-3 w-3 mr-1" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'project' ? 'bg-blue-100' :
                          notification.type === 'delivery' ? 'bg-green-100' :
                          'bg-yellow-100'
                        }`}>
                          {notification.type === 'project' && <Package className="h-4 w-4 text-blue-600" />}
                          {notification.type === 'delivery' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {notification.type === 'payment' && <DollarSign className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;





