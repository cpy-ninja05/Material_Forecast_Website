import React, { useEffect, useState } from 'react';
import { Filter, RefreshCw, BarChart3, Package, AlertTriangle, Truck, Warehouse, TrendingUp, Edit, Save, X, Plus, Eye } from 'lucide-react';

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Stock Status');
  
  // Edit states
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // View states
  const [viewingItem, setViewingItem] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Material definitions based on dataset
  const materialDefinitions = [
    { 
      id: 'steel_tons', 
      name: 'Steel (Tons)', 
      category: 'Structural Materials', 
      unit: 'tons',
      minThreshold: 20,
      maxThreshold: 100
    },
    { 
      id: 'copper_tons', 
      name: 'Copper (Tons)', 
      category: 'Conductors', 
      unit: 'tons',
      minThreshold: 2,
      maxThreshold: 10
    },
    { 
      id: 'cement_tons', 
      name: 'Cement (Tons)', 
      category: 'Construction Materials', 
      unit: 'tons',
      minThreshold: 15,
      maxThreshold: 50
    },
    { 
      id: 'aluminum_tons', 
      name: 'Aluminum (Tons)', 
      category: 'Conductors', 
      unit: 'tons',
      minThreshold: 1,
      maxThreshold: 8
    },
    { 
      id: 'insulators_count', 
      name: 'Insulators', 
      category: 'Electrical Equipment', 
      unit: 'pieces',
      minThreshold: 30,
      maxThreshold: 100
    },
    { 
      id: 'conductors_tons', 
      name: 'Conductors (Tons)', 
      category: 'Conductors', 
      unit: 'tons',
      minThreshold: 15,
      maxThreshold: 50
    },
    { 
      id: 'transformers_count', 
      name: 'Transformers', 
      category: 'Electrical Equipment', 
      unit: 'pieces',
      minThreshold: 1,
      maxThreshold: 5
    },
    { 
      id: 'switchgears_count', 
      name: 'Switchgears', 
      category: 'Electrical Equipment', 
      unit: 'pieces',
      minThreshold: 3,
      maxThreshold: 8
    },
    { 
      id: 'cables_count', 
      name: 'Cables', 
      category: 'Conductors', 
      unit: 'pieces',
      minThreshold: 4,
      maxThreshold: 10
    },
    { 
      id: 'protective_relays_count', 
      name: 'Protective Relays', 
      category: 'Protection Equipment', 
      unit: 'pieces',
      minThreshold: 2,
      maxThreshold: 8
    },
    { 
      id: 'oil_tons', 
      name: 'Transformer Oil (Tons)', 
      category: 'Electrical Equipment', 
      unit: 'tons',
      minThreshold: 2,
      maxThreshold: 5
    },
    { 
      id: 'foundation_concrete_tons', 
      name: 'Foundation Concrete (Tons)', 
      category: 'Construction Materials', 
      unit: 'tons',
      minThreshold: 10,
      maxThreshold: 30
    },
    { 
      id: 'bolts_count', 
      name: 'Bolts & Fasteners', 
      category: 'Structural Materials', 
      unit: 'pieces',
      minThreshold: 1000,
      maxThreshold: 2000
    }
  ];

  // Load inventory data from backend
  const loadInventory = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view inventory');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load inventory');
      }

      const data = await response.json();
      
      // If no inventory data exists, initialize it
      if (!data || data.length === 0) {
        await initializeInventory();
        // Reload inventory after initialization
        const reloadResponse = await fetch('http://localhost:5000/api/inventory', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          setInventoryItems(reloadData);
        }
      } else {
        setInventoryItems(data);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize inventory function
  const initializeInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to initialize inventory');
      }

      const response = await fetch('http://localhost:5000/api/inventory/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initialize inventory');
      }

      const result = await response.json();
      console.log('Inventory initialized:', result.message);
    } catch (err) {
      console.error('Error initializing inventory:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filter inventory items
  useEffect(() => {
    let filtered = inventoryItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.material_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All Categories') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'All Stock Status') {
      filtered = filtered.filter(item => {
        const itemStatus = getStatusValue(item);
        return itemStatus === statusFilter;
      });
    }

    setFilteredItems(filtered);
  }, [inventoryItems, searchTerm, categoryFilter, statusFilter]);

  // Helper functions
  const getStatusColor = (item) => {
    const quantity = item.quantity || 0;
    const minStock = item.min_stock || 0;
    const maxStock = item.max_stock || 0;
    
    if (quantity <= minStock) return 'text-red-600';
    if (quantity >= maxStock * 0.9) return 'text-orange-600';
    return 'text-green-600';
  };

  const getStatusBgColor = (item) => {
    const quantity = item.quantity || 0;
    const minStock = item.min_stock || 0;
    const maxStock = item.max_stock || 0;
    
    if (quantity <= minStock) return 'bg-red-100';
    if (quantity >= maxStock * 0.9) return 'bg-orange-100';
        return 'bg-green-100';
  };

  const getStatusText = (item) => {
    const quantity = item.quantity || 0;
    const minStock = item.min_stock || 0;
    const maxStock = item.max_stock || 0;
    
    if (quantity <= minStock) return 'Low Stock';
    if (quantity >= maxStock * 0.9) return 'Over Stock';
    return 'Healthy';
  };

  const getStatusValue = (item) => {
    const quantity = item.quantity || 0;
    const minStock = item.min_stock || 0;
    const maxStock = item.max_stock || 0;
    
    if (quantity <= minStock) return 'LOW_STOCK';
    if (quantity >= maxStock * 0.9) return 'OVERSTOCK';
    return 'HEALTHY';
  };

  // View functionality
  const handleViewItem = (item) => {
    setViewingItem(item);
    setShowViewModal(true);
  };

  // Edit functionality
  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditForm({
      min_stock: item.min_stock || 0,
      max_stock: item.max_stock || 0,
      available: item.available || 0,
      reserved: item.reserved || 0,
      in_transit: item.in_transit || 0,
      warehouse: item.warehouse || 'Main Warehouse'
    });
    setShowEditModal(true);
  };

  const handleSaveItem = async () => {
    if (!editingItem) return;
    
    setSaving(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update inventory');
        return;
      }

      // Calculate total quantity as sum of available, reserved, and in_transit
      const calculatedQuantity = (editForm.available || 0) + (editForm.reserved || 0) + (editForm.in_transit || 0);
      
      const updateData = {
        ...editForm,
        quantity: calculatedQuantity
      };

      const response = await fetch(`http://localhost:5000/api/inventory/${editingItem.material_code}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update inventory');
      }

      // Update local state with calculated quantity
      setInventoryItems(prev => prev.map(item => 
        item.material_code === editingItem.material_code 
          ? { ...item, ...updateData, updated_at: new Date().toISOString() }
          : item
      ));

      setShowEditModal(false);
      setEditingItem(null);
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating inventory:', err);
    } finally {
      setSaving(false);
    }
  };

  // Get unique categories for filter
  const getUniqueCategories = () => {
    const categories = [...new Set(inventoryItems.map(item => item.category).filter(Boolean))];
    return categories;
  };

  // Calculate statistics
  const getStatistics = () => {
    const totalItems = inventoryItems.length;
    const lowStockItems = inventoryItems.filter(item => getStatusValue(item) === 'LOW_STOCK').length;
    
    const totalInTransit = inventoryItems.reduce((sum, item) => sum + (item.in_transit || 0), 0);
    const totalWarehouses = [...new Set(inventoryItems.map(item => item.warehouse).filter(Boolean))].length;
    
    return { totalItems, lowStockItems, totalInTransit, totalWarehouses };
  };

  const statistics = getStatistics();

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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Categories</option>
              {getUniqueCategories().map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All Stock Status">All Stock Status</option>
              <option value="HEALTHY">Healthy</option>
              <option value="OVERSTOCK">Over Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
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
              <button 
                onClick={loadInventory}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {filteredItems.length} of {inventoryItems.length} items
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-3xl font-bold text-gray-900">{statistics.totalItems}</p>
                <p className="text-sm text-green-600">Active materials</p>
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
                <p className="text-3xl font-bold text-gray-900">{statistics.lowStockItems}</p>
                <p className="text-sm text-red-600">Need attention</p>
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
                <p className="text-3xl font-bold text-gray-900">{statistics.totalInTransit}</p>
                <p className="text-sm text-orange-600">Total units</p>
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
                <p className="text-3xl font-bold text-gray-900">{statistics.totalWarehouses}</p>
                <p className="text-sm text-gray-600">Active locations</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Warehouse className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading inventory...</span>
          </div>
        )}

          {/* Inventory Items Grid */}
        {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
                <p className="text-gray-600">
                  {inventoryItems.length === 0 
                    ? "No inventory items available. Please check back later."
                    : "No items match your current filters. Try adjusting your search criteria."
                  }
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.material_code} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-xs text-gray-500 mt-1">Code: {item.material_code}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBgColor(item)} ${getStatusColor(item)} flex items-center gap-1`}>
                      <TrendingUp className="h-3 w-3" />
                      {getStatusText(item)}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="text-3xl font-bold text-gray-900">{item.quantity || 0}</div>
                      <div className="text-sm text-gray-600">{item.unit}</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          (item.quantity || 0) <= (item.min_stock || 0) ? 'bg-red-500' :
                          (item.quantity || 0) >= (item.max_stock || 0) * 0.9 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(((item.quantity || 0) / (item.max_stock || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min: {item.min_stock || 0}</span>
                      <span>Max: {item.max_stock || 0}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available</span>
                      <span className="font-semibold text-gray-900">{item.available || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Reserved</span>
                      <span className="font-semibold text-gray-900">{item.reserved || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">In Transit</span>
                      <span className="font-semibold text-gray-900">{item.in_transit || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Warehouse</span>
                      <span className="font-semibold text-gray-900">{item.warehouse || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewItem(item)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            </div>
        )}
          </div>

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Edit Inventory Item</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Name
                  </label>
                  <input
                    type="text"
                    value={editingItem.name}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Quantity (Calculated)
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50 text-blue-700 font-semibold">
                    {(editForm.available || 0) + (editForm.reserved || 0) + (editForm.in_transit || 0)} {editingItem.unit}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total = Available + Reserved + In Transit
                  </p>
                  {((editForm.available || 0) + (editForm.reserved || 0) + (editForm.in_transit || 0)) > (editForm.max_stock || 0) && (
                    <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs text-orange-700">
                        ⚠️ Total quantity exceeds maximum stock threshold ({editForm.max_stock} {editingItem.unit})
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      value={editForm.min_stock}
                      onChange={(e) => setEditForm(prev => ({ ...prev, min_stock: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Stock
                    </label>
                    <input
                      type="number"
                      value={editForm.max_stock}
                      onChange={(e) => setEditForm(prev => ({ ...prev, max_stock: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>
            </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available
                    </label>
                    <input
                      type="number"
                      value={editForm.available}
                      onChange={(e) => setEditForm(prev => ({ ...prev, available: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ready for use</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reserved
                    </label>
                    <input
                      type="number"
                      value={editForm.reserved}
                      onChange={(e) => setEditForm(prev => ({ ...prev, reserved: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Allocated to projects</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      In Transit
                    </label>
                    <input
                      type="number"
                      value={editForm.in_transit}
                      onChange={(e) => setEditForm(prev => ({ ...prev, in_transit: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Being delivered</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warehouse
                  </label>
                  <input
                    type="text"
                    value={editForm.warehouse}
                    onChange={(e) => setEditForm(prev => ({ ...prev, warehouse: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showViewModal && viewingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Inventory Item Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">{viewingItem.name}</h4>
                      <p className="text-lg text-gray-600 mb-1">{viewingItem.category}</p>
                      <p className="text-sm text-gray-500">Material Code: {viewingItem.material_code}</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBgColor(viewingItem)} ${getStatusColor(viewingItem)} flex items-center gap-2`}>
                      <TrendingUp className="h-4 w-4" />
                      {getStatusText(viewingItem)}
                    </div>
                  </div>
                </div>

                {/* Quantity Overview */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-700 mb-1">
                        {viewingItem.quantity || 0}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">Total Quantity</div>
                      <div className="text-xs text-blue-500 mt-1">{viewingItem.unit}</div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {viewingItem.available || 0}
                      </div>
                      <div className="text-sm text-green-600 font-medium">Available</div>
                      <div className="text-xs text-green-500 mt-1">Ready for use</div>
                    </div>
                  </div>
                </div>

                {/* Stock Levels */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900">Stock Levels</h5>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {viewingItem.reserved || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Reserved</div>
                      <div className="text-xs text-gray-500 mt-1">Allocated to projects</div>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {viewingItem.in_transit || 0}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">In Transit</div>
                      <div className="text-xs text-gray-500 mt-1">Being delivered</div>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {viewingItem.warehouse || 'N/A'}
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-1">Storage location</div>
                    </div>
                  </div>
                </div>

                {/* Thresholds */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900">Stock Thresholds</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Minimum Stock</span>
                        <span className="text-lg font-bold text-red-600">{viewingItem.min_stock || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Maximum Stock</span>
                        <span className="text-lg font-bold text-green-600">{viewingItem.max_stock || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: '100%' }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Current Stock Level */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Current Stock Level</span>
                      <span className="text-lg font-bold text-blue-600">{viewingItem.quantity || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${
                          (viewingItem.quantity || 0) <= (viewingItem.min_stock || 0) ? 'bg-red-500' :
                          (viewingItem.quantity || 0) >= (viewingItem.max_stock || 0) * 0.9 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ 
                          width: `${Math.min(((viewingItem.quantity || 0) / (viewingItem.max_stock || 1)) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Min: {viewingItem.min_stock || 0}</span>
                      <span>Max: {viewingItem.max_stock || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h5 className="text-lg font-semibold text-gray-900">Additional Information</h5>
                  
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="text-sm font-medium text-gray-600 mb-1">Unit</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {viewingItem.unit || 'N/A'}
                    </div>
                  </div>

                  {viewingItem.created_at && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="text-sm font-medium text-gray-600 mb-1">Last Updated</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {new Date(viewingItem.updated_at || viewingItem.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;


