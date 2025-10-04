import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, BarChart3, Package, AlertTriangle, Truck, Warehouse, TrendingUp } from 'lucide-react';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Sample inventory data matching the image
  const sampleItems = [
    {
      id: 1,
      name: "Steel Tower",
      category: "Tower Equipment",
      status: "HEALTHY",
      quantity: 151,
      unit: "pcs",
      min: 89,
      max: 276,
      available: 150,
      reserved: 1,
      inTransit: 56,
      warehouses: 2
    },
    {
      id: 2,
      name: "Conductor Cable",
      category: "Cables",
      status: "OVERSTOCK",
      quantity: 685,
      unit: "km",
      min: 64,
      max: 542,
      available: 668,
      reserved: 17,
      inTransit: 21,
      warehouses: 2
    },
    {
      id: 3,
      name: "Insulator",
      category: "Insulators",
      status: "HEALTHY",
      quantity: 93,
      unit: "pcs",
      min: 70,
      max: 482,
      available: 70,
      reserved: 23,
      inTransit: 37,
      warehouses: 2
    },
    {
      id: 4,
      name: "Earth Wire",
      category: "Earthing",
      status: "HEALTHY",
      quantity: 145,
      unit: "km",
      min: 96,
      max: 442,
      available: 121,
      reserved: 24,
      inTransit: 91,
      warehouses: 2
    },
    {
      id: 5,
      name: "Power Transformer",
      category: "Transformers",
      status: "OVERSTOCK",
      quantity: 429,
      unit: "pcs",
      min: 28,
      max: 262,
      available: 392,
      reserved: 37,
      inTransit: 14,
      warehouses: 2
    },
    {
      id: 6,
      name: "Circuit Breaker",
      category: "Switchgear",
      status: "OVERSTOCK",
      quantity: 1038,
      unit: "pcs",
      min: 113,
      max: 690,
      available: 1015,
      reserved: 23,
      inTransit: 71,
      warehouses: 2
    }
  ];

  const recentActivity = [
    { action: "Stock Received", item: "Steel Tower", quantity: "50 units", time: "2h ago" },
    { action: "Stock Consumed", item: "Conductor Cable", quantity: "2.5 km", time: "4h ago" },
    { action: "In Transit", item: "Insulator", quantity: "100 units", time: "1d ago" }
  ];

  useEffect(() => {
    setItems(sampleItems);
    setAlerts([]);
      setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-green-600';
      case 'OVERSTOCK':
        return 'text-orange-600';
      case 'LOW STOCK':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'bg-green-100';
      case 'OVERSTOCK':
        return 'bg-orange-100';
      case 'LOW STOCK':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-2">Track material stock levels, monitor consumption, and manage warehouse operations</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Filters & Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Controls</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <input 
              type="text" 
              placeholder="Search materials..." 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Categories</option>
              <option>Tower Equipment</option>
              <option>Cables</option>
              <option>Insulators</option>
              <option>Earthing</option>
              <option>Transformers</option>
              <option>Switchgear</option>
            </select>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Status</option>
              <option>HEALTHY</option>
              <option>OVERSTOCK</option>
              <option>LOW STOCK</option>
            </select>
            
            <div className="ml-auto flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Grid View
              </button>
              <button 
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  viewMode === 'analytics' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Analytics
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">6 items</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">6</p>
                <p className="text-sm text-green-600">+2 this week</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alerts</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">All items in stock</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-3xl font-bold text-gray-900">290</p>
                <p className="text-sm text-orange-600">5 shipments</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warehouses</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
                <p className="text-sm text-gray-600">Active locations</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Warehouse className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Inventory Items Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sampleItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(item.status)} ${getStatusColor(item.status)} flex items-center gap-1`}>
                      <TrendingUp className="h-3 w-3" />
                      {item.status}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-3xl font-bold text-gray-900">{item.quantity}</div>
                      <div className="text-sm text-gray-600">{item.unit}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          item.quantity > item.max * 0.8 ? 'bg-green-500' :
                          item.quantity > item.min ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((item.quantity / item.max) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min: {item.min}</span>
                      <span>Max: {item.max}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-gray-900">{item.available}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reserved</span>
                      <span className="font-semibold text-gray-900">{item.reserved}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Transit</span>
                      <span className="font-semibold text-gray-900">{item.inTransit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Warehouses</span>
                      <span className="font-semibold text-gray-900">{item.warehouses}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        Update Stock
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stock Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
              </div>
              <div className="text-sm text-gray-600">No low stock alerts</div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-gray-900">{activity.action}: {activity.item} - {activity.quantity}</div>
                    <div className="text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;


