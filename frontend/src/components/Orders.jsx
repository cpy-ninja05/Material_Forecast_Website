import React, { useEffect, useState } from 'react';

const Orders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ request_id: '', dealer_id: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/purchase-orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createOrder = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ request_id: Number(form.request_id), dealer_id: Number(form.dealer_id) })
      });
      if (!res.ok) throw new Error('Failed to create order (ensure request approved)');
      const created = await res.json();
      setItems((prev)=>[created, ...prev]);
      setForm({ request_id: '', dealer_id: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Purchase Orders</h1>
      </div>
      <div className="rounded-lg border border-gray-800 p-4">
        <div className="text-sm font-medium mb-3">Create Order</div>
        <div className="grid md:grid-cols-4 gap-3 items-end">
          <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Approved Request ID" value={form.request_id} onChange={(e)=>setForm({...form,request_id:e.target.value})} />
          <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Dealer ID" value={form.dealer_id} onChange={(e)=>setForm({...form,dealer_id:e.target.value})} />
          <div />
          <button disabled={creating} onClick={createOrder} className="bg-indigo-600 hover:bg-indigo-700 text-sm px-3 py-2 rounded disabled:opacity-50">{creating? 'Creating...' : 'Create Order'}</button>
        </div>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">PO ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Request</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dealer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((o) => (
                <tr key={o.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-2">{o.id}</td>
                  <td className="px-4 py-2">{o.request_id}</td>
                  <td className="px-4 py-2">{o.dealer_id}</td>
                  <td className="px-4 py-2">{o.status}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-400" colSpan={4}>No orders.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;


