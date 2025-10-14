import React, { useEffect, useState } from 'react';

const Dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [priceForm, setPriceForm] = useState({ dealer_id: '', material_code: '', price: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dealers`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!res.ok) throw new Error('Failed to load dealers');
        const data = await res.json();
        setDealers(data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const createDealer = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/dealers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to create dealer');
      const created = await res.json();
      setDealers((prev) => [created, ...prev]);
      setForm({ name: '', phone: '', email: '' });
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const addPrice = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...priceForm, dealer_id: Number(priceForm.dealer_id), price: Number(priceForm.price) };
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/price-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to add price');
      await res.json();
      setPriceForm({ dealer_id: '', material_code: '', price: '' });
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dealers</h1>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <form onSubmit={createDealer} className="rounded-lg border border-gray-800 p-4">
          <div className="text-sm font-medium mb-3">Add Dealer</div>
          <div className="grid grid-cols-1 gap-3">
            <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
            <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
            <input type="email" className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
            <button disabled={creating} className="justify-self-start bg-indigo-600 hover:bg-indigo-700 text-sm px-3 py-2 rounded disabled:opacity-50">{creating? 'Creating...' : 'Create'}</button>
          </div>
        </form>
        <form onSubmit={addPrice} className="rounded-lg border border-gray-800 p-4">
          <div className="text-sm font-medium mb-3">Add Price</div>
          <div className="grid grid-cols-1 gap-3">
            <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Dealer ID" value={priceForm.dealer_id} onChange={(e)=>setPriceForm({...priceForm,dealer_id:e.target.value})} required />
            <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Material Code" value={priceForm.material_code} onChange={(e)=>setPriceForm({...priceForm,material_code:e.target.value})} required />
            <input className="bg-gray-800 text-gray-100 rounded px-3 py-2" placeholder="Price" value={priceForm.price} onChange={(e)=>setPriceForm({...priceForm,price:e.target.value})} required />
            <button className="justify-self-start bg-indigo-600 hover:bg-indigo-700 text-sm px-3 py-2 rounded">Add</button>
          </div>
        </form>
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {dealers.map((d) => (
                <tr key={d.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-2">{d.name || '-'}</td>
                  <td className="px-4 py-2">{d.phone || '-'}</td>
                  <td className="px-4 py-2">{d.email || '-'}</td>
                </tr>
              ))}
              {dealers.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-400" colSpan={3}>No dealers yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dealers;


