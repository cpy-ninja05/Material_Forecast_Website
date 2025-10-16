import React, { useEffect, useState } from 'react';
import { FileText, ShoppingCart, Plus, Download, FileSpreadsheet, FileText as FileTextIcon, RefreshCw, Filter, X, Calendar, Eye, CheckCircle, Clock, AlertCircle, Star } from 'lucide-react';
import { showToast } from '../utils/toast';

const PurchaseRequests = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    project: '',
    material: '',
    dealer: '',
    quantity: '',
    expectedDelivery: ''
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [projectFilter, setProjectFilter] = useState('All Projects');
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [availableDealers, setAvailableDealers] = useState([]);
  const [showAddDealerModal, setShowAddDealerModal] = useState(false);
  const [newDealerForm, setNewDealerForm] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: ''
  });

  // Order view and management states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const sampleDealers = [
    { name: "Power Tech Solutions", contact: "Rajesh Kumar", rating: 4.5 },
    { name: "Grid Equipment Ltd", contact: "Priya Sharma", rating: 4.2 },
    { name: "Electrical Components Co", contact: "Amit Singh", rating: 4.8 }
  ];

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view orders');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      setItems(data || []);
      
      // Extract unique projects for filter dropdown
      const projects = [...new Set((data || []).map(order => order.project).filter(Boolean))];
      setAvailableProjects(projects);
    } catch (err) {
      setError(err.message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMaterials = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/materials`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const materials = await response.json();
        setAvailableMaterials(materials);
      }
    } catch (err) {
      console.error('Error loading materials:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const projects = await response.json();
        setAvailableProjects(projects.map(p => p.name));
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadDealers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dealers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const dealers = await response.json();
        setAvailableDealers(dealers);
      } else {
        // Fallback to sample dealers if API fails
        setAvailableDealers(sampleDealers);
      }
    } catch (err) {
      console.error('Error loading dealers:', err);
      // Fallback to sample dealers
      setAvailableDealers(sampleDealers);
    }
  };

  const handleAddDealer = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to add dealer');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dealers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDealerForm)
      });

      if (response.ok) {
        const newDealer = await response.json();
        setAvailableDealers(prev => [...prev, newDealer]);
        setShowAddDealerModal(false);
        setNewDealerForm({
          name: '',
          contact: '',
          email: '',
          phone: '',
          address: ''
        });
        showToast.success('Dealer added successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add dealer');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding dealer:', err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadMaterials();
    loadProjects();
    loadDealers();
  }, []);

  // Filter orders based on search term, status, and project
  useEffect(() => {
    let filtered = items;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.project?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.dealer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All Status') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Project filter
    if (projectFilter !== 'All Projects') {
      filtered = filtered.filter(order => order.project === projectFilter);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, statusFilter, projectFilter]);

  // CSV Export functionality
  const exportToCSV = () => {
    setExportingCSV(true);
    
    try {
      if (filteredItems.length === 0) {
        showToast.warning('No orders to export. Please adjust your filters or create some orders first.');
        return;
      }

      // Helper function to escape CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // If value contains comma, newline, or quote, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      // Helper function to format currency for CSV
      const formatCurrencyForCSV = (amount) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount);
      };

      // Helper function to format date for CSV
      const formatDateForCSV = (dateString) => {
        if (!dateString) return '';
        try {
          const [year, month, day] = dateString.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          return date.toLocaleDateString('en-IN');
        } catch (error) {
          return dateString;
        }
      };

      const headers = [
        'Order ID', 
        'Project', 
        'Material', 
        'Dealer', 
        'Quantity', 
        'Unit Price', 
        'Total Price', 
        'Expected Delivery', 
        'Status', 
        'Created At',
        'Updated At'
      ];

      const csvRows = [
        headers.map(escapeCSV).join(','),
        ...filteredItems.map(order => [
          escapeCSV(order.order_id),
          escapeCSV(order.project),
          escapeCSV(order.material),
          escapeCSV(order.dealer),
          escapeCSV(order.quantity),
          escapeCSV(formatCurrencyForCSV(order.unit_price)),
          escapeCSV(formatCurrencyForCSV(order.total_price)),
          escapeCSV(formatDateForCSV(order.expected_delivery)),
          escapeCSV(order.status),
          escapeCSV(order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : ''),
          escapeCSV(order.updated_at ? new Date(order.updated_at).toLocaleDateString('en-IN') : '')
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `orders_export_${timestamp}.csv`;

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);

      // Show success message
      showToast.success(`Successfully exported ${filteredItems.length} order(s) to ${filename}`);
      
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast.error('Failed to export CSV. Please try again or contact support if the issue persists.');
    } finally {
      setExportingCSV(false);
    }
  };

  // Order management functions
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    
    setUpdatingStatus(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to update order status');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${selectedOrder.order_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }

      // Update the order in the local state
      setItems(prev => prev.map(order => 
        order.order_id === selectedOrder.order_id 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      ));

      // Update selected order
      setSelectedOrder(prev => ({ ...prev, status: newStatus, updated_at: new Date().toISOString() }));
      
    } catch (err) {
      setError(err.message);
      console.error('Error updating order status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    if (!window.confirm(`Are you sure you want to delete order ${selectedOrder.order_id}? This action cannot be undone.`)) {
      return;
    }
    
    setDeletingOrder(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to delete orders');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${selectedOrder.order_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete order');
      }

      // Remove the order from local state
      setItems(prev => prev.filter(order => order.order_id !== selectedOrder.order_id));
      
      // Close modal
      setShowOrderModal(false);
      setSelectedOrder(null);
      
    } catch (err) {
      setError(err.message);
      console.error('Error deleting order:', err);
    } finally {
      setDeletingOrder(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to create orders');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const newOrder = await response.json();
      setItems(prev => [newOrder, ...prev]);
      setOrderForm({
        project: '',
        material: '',
        dealer: '',
        quantity: '',
        expectedDelivery: ''
      });
      setShowCreateModal(false);
    } catch (err) {
      setError(err.message);
      console.error('Error creating order:', err);
    } finally {
      setCreating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'DELIVERED':
        return 'bg-blue-100 text-blue-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    // Handle both YYYY-MM-DD format and other date formats
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Custom date picker component
  const DatePicker = ({ value, onChange, min, required }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value || '');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = new Date();
    const minDate = min ? new Date(min) : today;

    const handleDateSelect = (date) => {
      // Create a new date object to avoid timezone issues
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      // Create date string in YYYY-MM-DD format without timezone conversion
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      setSelectedDate(dateStr);
      onChange(dateStr);
      setIsOpen(false);
    };

    const navigateMonth = (direction) => {
      setCurrentMonth(prev => {
        const newMonth = new Date(prev);
        newMonth.setMonth(prev.getMonth() + direction);
        return newMonth;
      });
    };

    // Close date picker when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (isOpen && !event.target.closest('.date-picker-container')) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const generateCalendarDays = () => {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay.getDay(); i++) {
        days.push(null);
      }

      // Add days of the month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        days.push(date);
      }

      return days;
    };

    return (
      <div className="relative date-picker-container">
        <input
          type="text"
          value={selectedDate ? (() => {
            const [year, month, day] = selectedDate.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('en-IN');
          })() : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          placeholder="Select delivery date"
          required={required}
        />
        <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateMonth(-1);
                  }}
                  className={`p-1 rounded-full transition-colors ${
                    currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-100'
                  }`}
                  disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                >
                  <svg className={`w-4 h-4 ${
                    currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </h3>
                  {currentMonth.getMonth() !== today.getMonth() || currentMonth.getFullYear() !== today.getFullYear() ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setCurrentMonth(today);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      Today
                    </button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateMonth(1);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-1 text-center text-gray-500 font-medium">
                    {day}
                  </div>
                ))}
                {generateCalendarDays().map((date, index) => {
                  if (!date) return <div key={index} className="invisible"></div>;
                  
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const day = date.getDate();
                  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const isDisabled = date < minDate;
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDateSelect(date);
                      }}
                      disabled={isDisabled}
                      className={`p-1 text-center text-sm rounded hover:bg-purple-100 ${
                        isDisabled ? 'text-gray-300 cursor-not-allowed' :
                        isSelected ? 'bg-blue-600 text-white' :
                        'text-gray-700 hover:text-blue-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-3xl font-bold text-gray-900 text-center md:text-left">Procurement Management</h1>
            <p className="text-gray-600 mt-2 text-center md:text-left">Manage purchase orders, track approvals, and coordinate with dealers</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Filters & Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters & Actions</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Status</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>DELIVERED</option>
              <option>CANCELLED</option>
            </select>
            
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option>All Projects</option>
              {availableProjects.map((project, index) => (
                <option key={index} value={project}>{project}</option>
              ))}
            </select>
            
            <button 
              onClick={exportToCSV}
              disabled={exportingCSV}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
            >
              {exportingCSV ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export CSV
                </>
              )}
            </button>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Order
            </button>
            
            <button 
              onClick={loadOrders}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
            <div className="ml-auto flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">
                {filteredItems.length} of {items.length} orders
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <RefreshCw className="h-16 w-16 mx-auto text-gray-300 mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading orders...</h3>
                <p className="text-gray-600">Please wait while we fetch your orders.</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {items.length === 0 ? 'No orders found' : 'No orders match your filters'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {items.length === 0 
                    ? 'Create your first order to get started with procurement management.'
                    : 'Try adjusting your search criteria or filters to find orders.'
                  }
                </p>
                {items.length === 0 && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Order
                </button>
                )}
                {items.length > 0 && (
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('All Status');
                      setProjectFilter('All Projects');
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dealer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Delivery</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredItems.map((order) => (
                        <tr key={order.order_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.project}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.material}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.dealer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(order.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {formatCurrency(order.total_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(order.expected_delivery)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => handleViewOrder(order)}
                              className="text-blue-600 hover:text-purple-900 flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Order Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Showing:</span>
                  <span className="text-sm font-semibold text-gray-900">{filteredItems.length} of {items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending:</span>
                  <span className="text-sm font-semibold text-gray-900">{filteredItems.filter(o => o.status === 'PENDING').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="text-sm font-semibold text-gray-900">{filteredItems.filter(o => o.status === 'APPROVED').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivered:</span>
                  <span className="text-sm font-semibold text-gray-900">{filteredItems.filter(o => o.status === 'DELIVERED').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Filtered Value:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(filteredItems.reduce((sum, o) => sum + (o.total_price || 0), 0))}</span>
                </div>
                {(searchTerm || statusFilter !== 'All Status' || projectFilter !== 'All Projects') && (
                  <div className="pt-2 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('All Status');
                        setProjectFilter('All Projects');
                      }}
                      className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Top Dealers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Dealers</h3>
                <button
                  onClick={() => setShowAddDealerModal(true)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add New Dealer
                </button>
              </div>
              <div className="space-y-4">
                {availableDealers.map((dealer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{dealer.name}</div>
                      <div className="text-sm text-gray-600">{dealer.contact}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.floor(dealer.rating || 4.0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 ml-1">
                        {dealer.rating || 4.0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Create New Order</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project *
                </label>
                <select
                  value={orderForm.project}
                  onChange={(e) => setOrderForm({...orderForm, project: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Project</option>
                  {availableProjects.map((project, index) => (
                    <option key={index} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material *
                </label>
                <select
                  value={orderForm.material}
                  onChange={(e) => setOrderForm({...orderForm, material: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Material</option>
                  {availableMaterials.map((material, index) => (
                    <option key={index} value={material.name}>{material.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dealer *
                </label>
                <select
                  value={orderForm.dealer}
                  onChange={(e) => setOrderForm({...orderForm, dealer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Dealer</option>
                  {availableDealers.map((dealer, index) => (
                    <option key={index} value={dealer.name}>{dealer.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date *
                </label>
                <DatePicker
                  value={orderForm.expectedDelivery}
                  onChange={(date) => {
                    console.log('Date selected:', date);
                    setOrderForm({...orderForm, expectedDelivery: date});
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required={true}
                />
                {orderForm.expectedDelivery && (
                  <p className="mt-1 text-xs text-gray-500">
                    Selected: {(() => {
                      const [year, month, day] = orderForm.expectedDelivery.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return date.toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Pricing Information</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Unit prices are automatically calculated based on current market rates and dealer pricing. You don't need to specify pricing manually.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order View Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Order Information */}
            <div className="space-y-6">
              {/* Order Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedOrder.order_id}</h3>
                    <p className="text-sm text-gray-600">Created: {formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{selectedOrder.status}</span>
                  </span>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Project</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.project}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Material</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.material}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dealer</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.dealer}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedOrder.unit_price)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Price</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.total_price)}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Delivery</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOrder.expected_delivery)}</p>
              </div>

              {/* Status Update Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h4>
                <div className="flex flex-wrap gap-3">
                  {['PENDING', 'APPROVED', 'DELIVERED', 'CANCELLED'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedOrder.status === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {updatingStatus && selectedOrder.status === status ? 'Updating...' : status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Management Actions */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Order Management</h4>
                <div className="flex gap-3">
                  {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'CANCELLED') && (
                    <button
                      onClick={handleDeleteOrder}
                      disabled={deletingOrder}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {deletingOrder ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Delete Order
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      // Copy order details to clipboard
                      const orderText = `Order ID: ${selectedOrder.order_id}
Project: ${selectedOrder.project}
Material: ${selectedOrder.material}
Dealer: ${selectedOrder.dealer}
Quantity: ${selectedOrder.quantity}
Unit Price: ${formatCurrency(selectedOrder.unit_price)}
Total Price: ${formatCurrency(selectedOrder.total_price)}
Expected Delivery: ${formatDate(selectedOrder.expected_delivery)}
Status: ${selectedOrder.status}`;
                      
                      navigator.clipboard.writeText(orderText).then(() => {
                        showToast.success('Order details copied to clipboard!');
                      });
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Copy Details
                  </button>
                </div>
              </div>

              {/* Status Change Information */}
              {selectedOrder.status === 'DELIVERED' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Order Completed</h4>
                      <p className="mt-1 text-sm text-green-700">
                        This order has been marked as delivered. You can now delete it from your records if needed.
                        The total cost of {formatCurrency(selectedOrder.total_price)} has been processed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrder.status === 'CANCELLED' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Order Cancelled</h4>
                      <p className="mt-1 text-sm text-red-700">
                        This order has been cancelled. You can now delete it from your records to clean up your order list.
                        No charges have been applied for this cancelled order.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Dealer Modal */}
      {showAddDealerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Dealer</h3>
              <button
                onClick={() => setShowAddDealerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddDealer(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dealer Name *
                </label>
                <input
                  type="text"
                  value={newDealerForm.name}
                  onChange={(e) => setNewDealerForm({...newDealerForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  value={newDealerForm.contact}
                  onChange={(e) => setNewDealerForm({...newDealerForm, contact: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newDealerForm.email}
                  onChange={(e) => setNewDealerForm({...newDealerForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newDealerForm.phone}
                  onChange={(e) => setNewDealerForm({...newDealerForm, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={newDealerForm.address}
                  onChange={(e) => setNewDealerForm({...newDealerForm, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddDealerModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;


