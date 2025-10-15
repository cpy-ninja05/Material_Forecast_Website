import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react';

const Orders = () => {
  console.log('Orders component mounted');
  
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ request_id: '', dealer_id: '' });
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [dealers, setDealers] = useState([]);

  const load = async () => {
    console.log('===== LOAD FUNCTION CALLED =====');
    console.log('API URL:', `${import.meta.env.VITE_API_BASE_URL}/api/orders`);
    console.log('Token exists:', !!localStorage.getItem('token'));
    
    setLoading(true);
    setError('');
    
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/orders`;
      console.log('Fetching from:', url);
      
      const res = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to load orders: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      console.log('===== RAW DATA FROM API =====');
      console.log('Orders fetched from /api/orders:', data);
      console.log('Data type:', typeof data);
      console.log('Is Array:', Array.isArray(data));
      console.log('Number of orders:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('First order sample:', data[0]);
      }
      
      // Transform the data to match the expected format
      const transformedOrders = (data || []).map((order, index) => {
        console.log(`Transforming order ${index}:`, order);
        return {
          id: order.order_id || order.id || `ORDER_${index}`,
          request_id: order.order_id || order.id || 'N/A',
          dealer_id: order.dealer || order.dealer_id || 'N/A',
          status: order.status || 'Pending',
          material: order.material || 'N/A',
          quantity: order.quantity || 0,
          total_price: order.total_price || 0,
          created_at: order.created_at || '',
          project: order.project || order.project_id || 'N/A',
          expected_delivery: order.expected_delivery || ''
        };
      });
      
      console.log('===== TRANSFORMED ORDERS =====');
      console.log('Transformed orders:', transformedOrders);
      console.log('Setting items state with', transformedOrders.length, 'orders');
      
      setItems(transformedOrders);
      console.log('Items state updated successfully');
    } catch (e) {
      console.error('===== ERROR IN LOAD =====');
      console.error('Error loading orders:', e);
      console.error('Error stack:', e.stack);
      setError(e.message);
    } finally {
      setLoading(false);
      console.log('===== LOAD FUNCTION COMPLETE =====');
    }
  };

  const loadPurchaseRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/purchase-requests`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Filter only approved requests
        const approved = data.filter(req => req.status === 'Approved');
        setPurchaseRequests(approved);
      }
    } catch (e) {
      console.error('Error loading purchase requests:', e);
    }
  };

  const loadDealers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dealers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDealers(data);
      }
    } catch (e) {
      console.error('Error loading dealers:', e);
    }
  };

  useEffect(() => {
    console.log('===== useEffect RUNNING =====');
    console.log('About to call load(), loadPurchaseRequests(), loadDealers()');
    load(); 
    loadPurchaseRequests();
    loadDealers();
  }, []);

  const createOrder = async () => {
    if (!form.request_id || !form.dealer_id) {
      setError('Please select both a purchase request and a dealer');
      return;
    }

    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/purchase-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ request_id: Number(form.request_id), dealer_id: Number(form.dealer_id) })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      const created = await res.json();
      setItems((prev)=>[created, ...prev]);
      setForm({ request_id: '', dealer_id: '' });
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-8 py-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase Orders</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Convert approved purchase requests into orders</p>
            </div>
      </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Create Order Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Order</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approved Purchase Request *
              </label>
              <select 
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.request_id} 
                onChange={(e)=>setForm({...form,request_id:e.target.value})}
              >
                <option value="">Select Request</option>
                {purchaseRequests.map(req => (
                  <option key={req.id} value={req.id}>
                    Request #{req.id} - {req.material} ({req.quantity} {req.unit})
                  </option>
                ))}
              </select>
              {purchaseRequests.length === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  No approved requests available. Create and approve a purchase request first.
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dealer *
              </label>
              <select 
                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.dealer_id} 
                onChange={(e)=>setForm({...form,dealer_id:e.target.value})}
              >
                <option value="">Select Dealer</option>
                {dealers.map(dealer => (
                  <option key={dealer.id} value={dealer.id}>
                    {dealer.name} - {dealer.contact}
                  </option>
                ))}
              </select>
              {dealers.length === 0 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  No dealers available. Add dealers first.
                </p>
              )}
            </div>
            
            <button 
              disabled={creating || purchaseRequests.length === 0 || dealers.length === 0} 
              onClick={createOrder} 
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {creating ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Loading orders...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}
        {!loading && items.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No orders found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first order to get started with procurement management.
              </p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Step 1: Create and approve a purchase request
                </p>
                <p className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Step 2: Add dealers to the system
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  Step 3: Create an order using the form above
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PO ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Request ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dealer ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">#{o.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">#{o.request_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">#{o.dealer_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          o.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          o.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Orders;


