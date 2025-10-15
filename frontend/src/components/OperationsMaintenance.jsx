import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from './ui/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

const OperationsMaintenance = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [outages, setOutages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetForm, setAssetForm] = useState({ project_id: '', asset_type: 'tower', name: '', status: 'planned', location: '', voltage_kv: 132, specs: '' });
  const [outageForm, setOutageForm] = useState({ asset_id: '', start_time: '', end_time: '', cause: '', severity: 'low', remarks: '' });

  const canCreateAsset = ['admin','planner'].includes(user?.role);
  const canLogOutage = ['admin','operator'].includes(user?.role);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, o] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/assets`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/outages`)
      ]);
      setAssets(a.data);
      setOutages(o.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const submitAsset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/assets`, assetForm);
      setAssetForm({ project_id: '', asset_type: 'tower', name: '', status: 'planned', location: '', voltage_kv: 132, specs: '' });
      fetchAll();
      showToast.success('Asset created successfully!');
    } catch (e) {
      showToast.error(e.response?.data?.error || 'Failed to create asset');
    }
  };

  const submitOutage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/outages`, outageForm);
      setOutageForm({ asset_id: '', start_time: '', end_time: '', cause: '', severity: 'low', remarks: '' });
      fetchAll();
      showToast.success('Outage logged successfully!');
    } catch (e) {
      showToast.error(e.response?.data?.error || 'Failed to log outage');
    }
  };

  const assetColumns = [
    { key: 'id', label: 'ID' },
    { key: 'project_id', label: 'Project' },
    { key: 'asset_type', label: 'Type' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'location', label: 'Location' },
    { key: 'voltage_kv', label: 'Voltage (kV)' }
  ];

  const outageColumns = [
    { key: 'id', label: 'ID' },
    { key: 'asset_id', label: 'Asset' },
    { key: 'start_time', label: 'Start' },
    { key: 'end_time', label: 'End' },
    { key: 'cause', label: 'Cause' },
    { key: 'severity', label: 'Severity' },
    { key: 'remarks', label: 'Remarks' }
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
        <h1 className="text-2xl font-bold text-gray-900">Operations & Maintenance</h1>
        <p className="text-gray-600 mt-1">Manage grid assets and outages</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canCreateAsset && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Create Asset</h2>
            <form onSubmit={submitAsset} className="grid grid-cols-2 gap-3">
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Project ID" value={assetForm.project_id} onChange={(e)=>setAssetForm({...assetForm, project_id:e.target.value})} required />
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={assetForm.asset_type} onChange={(e)=>setAssetForm({...assetForm, asset_type:e.target.value})}>
                {['tower','conductor','substation','transformer','hvdc_converter'].map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Name" value={assetForm.name} onChange={(e)=>setAssetForm({...assetForm, name:e.target.value})} />
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={assetForm.status} onChange={(e)=>setAssetForm({...assetForm, status:e.target.value})}>
                {['planned','active','maintenance','out_of_service'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Location" value={assetForm.location} onChange={(e)=>setAssetForm({...assetForm, location:e.target.value})} />
              <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Voltage (kV)" value={assetForm.voltage_kv} onChange={(e)=>setAssetForm({...assetForm, voltage_kv:Number(e.target.value)})} />
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Specs" value={assetForm.specs} onChange={(e)=>setAssetForm({...assetForm, specs:e.target.value})} />
              <button className="bg-indigo-600 text-white py-2 rounded col-span-2">Create Asset</button>
            </form>
          </div>
        )}

        {canLogOutage && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Log Outage</h2>
            <form onSubmit={submitOutage} className="grid grid-cols-2 gap-3">
              <input className="border p-2 rounded" placeholder="Asset ID" value={outageForm.asset_id} onChange={(e)=>setOutageForm({...outageForm, asset_id:e.target.value})} required />
              <input className="border p-2 rounded" placeholder="Start (ISO)" value={outageForm.start_time} onChange={(e)=>setOutageForm({...outageForm, start_time:e.target.value})} />
              <input className="border p-2 rounded" placeholder="End (ISO)" value={outageForm.end_time} onChange={(e)=>setOutageForm({...outageForm, end_time:e.target.value})} />
              <input className="border p-2 rounded" placeholder="Cause" value={outageForm.cause} onChange={(e)=>setOutageForm({...outageForm, cause:e.target.value})} />
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={outageForm.severity} onChange={(e)=>setOutageForm({...outageForm, severity:e.target.value})}>
                {['low','medium','high','critical'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="border p-2 rounded col-span-2" placeholder="Remarks" value={outageForm.remarks} onChange={(e)=>setOutageForm({...outageForm, remarks:e.target.value})} />
              <button className="bg-indigo-600 text-white py-2 rounded col-span-2">Log Outage</button>
            </form>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable title="Assets" data={assets} columns={assetColumns} searchable sortable />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable title="Outages" data={outages} columns={outageColumns} searchable sortable />
        </div>
      </div>
    </div>
  );
};

export default OperationsMaintenance;



