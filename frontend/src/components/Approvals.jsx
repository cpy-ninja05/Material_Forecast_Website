import React, { useEffect, useState } from 'react';

const Approvals = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/purchase-requests', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setItems((data || []).filter(d => d.status === 'pending_approval'));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (requestId, decision) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/approvals/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ request_id: requestId, decision })
      });
      if (!res.ok) throw new Error('Decision failed');
      await res.json();
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Approvals</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Lines</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-gray-800/40">
                  <td className="px-4 py-2">{r.id}</td>
                  <td className="px-4 py-2">{(r.lines || []).length}</td>
                  <td className="px-4 py-2 text-right space-x-2">
                    <button onClick={() => decide(r.id, 'approve')} className="px-3 py-1 text-xs rounded bg-green-600 hover:bg-green-700">Approve</button>
                    <button onClick={() => decide(r.id, 'reject')} className="px-3 py-1 text-xs rounded bg-red-600 hover:bg-red-700">Reject</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-gray-400" colSpan={3}>No pending approvals.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Approvals;



