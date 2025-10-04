import React, { useEffect, useState } from 'react';
import { FileText, ShoppingCart, Plus, Download, FileSpreadsheet, FileText as FileTextIcon, RefreshCw, Filter, X, Calendar } from 'lucide-react';

const PurchaseRequests = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    project: '',
    material: '',
    dealer: '',
    quantity: '',
    unitPrice: '',
    expectedDelivery: ''
  });

  // Sample data matching the image
  const sampleOrders = [];
  const sampleDealers = [
    { name: "Power Tech Solutions", contact: "Rajesh Kumar", rating: 4.5 },
    { name: "Grid Equipment Ltd", contact: "Priya Sharma", rating: 4.2 },
    { name: "Electrical Components Co", contact: "Amit Singh", rating: 4.8 }
  ];

  useEffect(() => {
    setItems(sampleOrders);
    setLoading(false);
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Here you would typically send the data to your backend
      const newOrder = {
        id: Date.now(),
        ...orderForm,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };
      setItems(prev => [newOrder, ...prev]);
      setOrderForm({
        project: '',
        material: '',
        dealer: '',
        quantity: '',
        unitPrice: '',
        expectedDelivery: ''
      });
      setShowCreateModal(false);
    } catch (error) {
      setError('Failed to create order');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-600 mt-2">Manage purchase orders, track approvals, and coordinate with dealers</p>
        </div>
      </div>

      <div className="p-8 space-y-8">
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Status</option>
              <option>PENDING</option>
              <option>APPROVED</option>
              <option>DELIVERED</option>
            </select>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>All Projects</option>
              <option>Mumbai-Pune Transmission Line</option>
              <option>Delhi Grid Substation</option>
              <option>Bangalore Ring Road Transmission</option>
            </select>
            
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Order
            </button>
            
            <div className="ml-auto flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">{items.length} orders</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600 mb-6">Create your first order to get started with procurement management.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Create Order
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                </div>
                <div className="p-6">
                  {/* Orders table would go here */}
                  <p className="text-gray-600">Orders will be displayed here</p>
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
                  <span className="text-sm text-gray-600">Total Orders:</span>
                  <span className="text-sm font-semibold text-gray-900">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Pending Approval:</span>
                  <span className="text-sm font-semibold text-gray-900">{items.filter(o => o.status === 'PENDING').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="text-sm font-semibold text-gray-900">{items.filter(o => o.status === 'APPROVED').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Delivered:</span>
                  <span className="text-sm font-semibold text-gray-900">{items.filter(o => o.status === 'DELIVERED').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Value:</span>
                  <span className="text-sm font-semibold text-gray-900">₹{items.reduce((sum, o) => sum + (o.quantity * o.unitPrice), 0)}</span>
                </div>
              </div>
            </div>

            {/* Top Dealers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Dealers</h3>
              <div className="space-y-4">
                {sampleDealers.map((dealer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{dealer.name}</div>
                      <div className="text-sm text-gray-600">{dealer.contact}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{dealer.rating}</div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Project</option>
                  <option value="Mumbai-Pune Transmission Line">Mumbai-Pune Transmission Line</option>
                  <option value="Delhi Grid Substation">Delhi Grid Substation</option>
                  <option value="Bangalore Ring Road Transmission">Bangalore Ring Road Transmission</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material *
                </label>
                <select
                  value={orderForm.material}
                  onChange={(e) => setOrderForm({...orderForm, material: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Material</option>
                  <option value="Steel Tower">Steel Tower</option>
                  <option value="Conductor Cable">Conductor Cable</option>
                  <option value="Insulator">Insulator</option>
                  <option value="Power Transformer">Power Transformer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dealer *
                </label>
                <select
                  value={orderForm.dealer}
                  onChange={(e) => setOrderForm({...orderForm, dealer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Dealer</option>
                  {sampleDealers.map((dealer, index) => (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter quantity"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Price (₹) *
                </label>
                <input
                  type="number"
                  value={orderForm.unitPrice}
                  onChange={(e) => setOrderForm({...orderForm, unitPrice: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter unit price"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={orderForm.expectedDelivery}
                    onChange={(e) => setOrderForm({...orderForm, expectedDelivery: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="dd-mm-yyyy"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
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
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Order'}
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


