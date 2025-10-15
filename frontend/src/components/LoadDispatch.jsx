import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from './ui/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

const LoadDispatch = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ timestamp: '', region: 'North', demand_mw: '', supply_mw: '', frequency_hz: 50.0, voltage_kv: 220, remarks: '' });

  const canLog = ['admin','operator'].includes(user?.role);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/dispatch`);
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/dispatch`, form);
      setForm({ timestamp: '', region: 'North', demand_mw: '', supply_mw: '', frequency_hz: 50.0, voltage_kv: 220, remarks: '' });
      fetchAll();
      showToast.success('Log added successfully!');
    } catch (e) {
      showToast.error(e.response?.data?.error || 'Failed to add log');
    }
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp' },
    { key: 'region', label: 'Region' },
    { key: 'demand_mw', label: 'Demand (MW)' },
    { key: 'supply_mw', label: 'Supply (MW)' },
    { key: 'frequency_hz', label: 'Freq (Hz)' },
    { key: 'voltage_kv', label: 'Voltage (kV)' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'created_by', label: 'By' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Load Dispatch & Real-Time Balancing</h1>
        <p className="text-gray-600 mt-1">Log real-time demand/supply, track frequency and voltage</p>
      </div>

      {canLog && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Add Dispatch Log</h2>
          <form onSubmit={submit} className="grid grid-cols-3 gap-3">
            <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Timestamp (ISO)" value={form.timestamp} onChange={(e)=>setForm({...form, timestamp:e.target.value})} />
            <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={form.region} onChange={(e)=>setForm({...form, region:e.target.value})}>
              {['North','South','East','West','Central'].map(r=> <option key={r} value={r}>{r}</option>)}
            </select>
            <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Demand (MW)" value={form.demand_mw} onChange={(e)=>setForm({...form, demand_mw:Number(e.target.value)})} />
            <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Supply (MW)" value={form.supply_mw} onChange={(e)=>setForm({...form, supply_mw:Number(e.target.value)})} />
            <input type="number" step="0.01" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Freq (Hz)" value={form.frequency_hz} onChange={(e)=>setForm({...form, frequency_hz:Number(e.target.value)})} />
            <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Voltage (kV)" value={form.voltage_kv} onChange={(e)=>setForm({...form, voltage_kv:Number(e.target.value)})} />
            <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded col-span-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Remarks" value={form.remarks} onChange={(e)=>setForm({...form, remarks:e.target.value})} />
            <button className="bg-indigo-600 text-white py-2 rounded col-span-3">Add Log</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <DataTable title="Dispatch Logs" data={logs} columns={columns} searchable sortable />
      </div>
    </div>
  );
};

export default LoadDispatch;



