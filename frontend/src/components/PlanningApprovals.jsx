import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from './ui/DataTable';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../utils/toast';

const PlanningApprovals = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projectForm, setProjectForm] = useState({ name: '', region: 'North', corridor_voltage_kv: 765, technology: 'AC', length_km: 100, substation_type: 'AIS', budget: 30000000 });
  const [permitForm, setPermitForm] = useState({ project_id: '', permit_type: 'RoW', status: 'submitted', doc_url: '', remarks: '' });
  const [uploading, setUploading] = useState(false);

  const canEdit = ['admin', 'planner'].includes(user?.role);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pr, pe] = await Promise.all([
        axios.get('http://localhost:5000/api/projects'),
        axios.get('http://localhost:5000/api/permits')
      ]);
      setProjects(pr.data);
      setPermits(pe.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const submitProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/projects', projectForm);
      setProjectForm({ name: '', region: 'North', corridor_voltage_kv: 765, technology: 'AC', length_km: 100, substation_type: 'AIS', budget: 30000000 });
      fetchAll();
      showToast.success('Project created successfully!');
    } catch (e) {
      showToast.error(e.response?.data?.error || 'Failed to create project');
    }
  };

  const submitPermit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/permits', permitForm);
      setPermitForm({ project_id: '', permit_type: 'RoW', status: 'submitted', doc_url: '', remarks: '' });
      fetchAll();
      showToast.success('Permit created successfully!');
    } catch (e) {
      showToast.error(e.response?.data?.error || 'Failed to create permit');
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/upload/permit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPermitForm(prev => ({ ...prev, doc_url: res.data.url }));
      showToast.success('File uploaded successfully!');
    } catch (err) {
      showToast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const projectColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'region', label: 'Region' },
    { key: 'corridor_voltage_kv', label: 'Voltage (kV)' },
    { key: 'technology', label: 'Technology' },
    { key: 'length_km', label: 'Length (km)' },
    { key: 'substation_type', label: 'Substation' },
    { key: 'status', label: 'Status' },
    { key: 'budget', label: 'Budget', format: (v) => `₹${(Number(v||0)/10000000).toFixed(2)} Cr` }
  ];

  const permitsColumns = [
    { key: 'id', label: 'ID' },
    { key: 'project_id', label: 'Project' },
    { key: 'permit_type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'issued_on', label: 'Issued' },
    { key: 'expires_on', label: 'Expires' },
    { key: 'doc_url', label: 'Document' },
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
        <h1 className="text-2xl font-bold text-gray-900">Planning & Approvals</h1>
        <p className="text-gray-600 mt-1">Manage corridors, projects, and statutory clearances</p>
      </div>

      {canEdit && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Create Project</h2>
            <form onSubmit={submitProject} className="grid grid-cols-2 gap-3">
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Name" value={projectForm.name} onChange={(e)=>setProjectForm({...projectForm, name:e.target.value})} required />
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={projectForm.region} onChange={(e)=>setProjectForm({...projectForm, region:e.target.value})}>
                {['North','South','East','West','Central'].map(r=> <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Voltage (kV)" value={projectForm.corridor_voltage_kv} onChange={(e)=>setProjectForm({...projectForm, corridor_voltage_kv:Number(e.target.value)})} />
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={projectForm.technology} onChange={(e)=>setProjectForm({...projectForm, technology:e.target.value})}>
                {['AC','HVDC'].map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Length (km)" value={projectForm.length_km} onChange={(e)=>setProjectForm({...projectForm, length_km:Number(e.target.value)})} />
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={projectForm.substation_type} onChange={(e)=>setProjectForm({...projectForm, substation_type:e.target.value})}>
                {['AIS','GIS'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <input type="number" className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Budget (₹)" value={projectForm.budget} onChange={(e)=>setProjectForm({...projectForm, budget:Number(e.target.value)})} />
              <button className="bg-indigo-600 text-white py-2 rounded col-span-2">Create Project</button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Create Permit</h2>
            <form onSubmit={submitPermit} className="grid grid-cols-2 gap-3">
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={permitForm.project_id} onChange={(e)=>setPermitForm({...permitForm, project_id:e.target.value})} required>
                <option value="">Select Project</option>
                {projects.map(p=> <option key={p.id} value={p.id}>{p.name || `Project ${p.id}`}</option>)}
              </select>
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={permitForm.permit_type} onChange={(e)=>setPermitForm({...permitForm, permit_type:e.target.value})}>
                {['RoW','Environment','Forest','CEA','CERC'].map(pt=> <option key={pt} value={pt}>{pt}</option>)}
              </select>
              <select className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={permitForm.status} onChange={(e)=>setPermitForm({...permitForm, status:e.target.value})}>
                {['submitted','approved','rejected'].map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Document URL" value={permitForm.doc_url} onChange={(e)=>setPermitForm({...permitForm, doc_url:e.target.value})} />
              <input type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleUpload} className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              {uploading && <div className="text-sm text-gray-500 col-span-2">Uploading...</div>}
              <input className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded col-span-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Remarks" value={permitForm.remarks} onChange={(e)=>setPermitForm({...permitForm, remarks:e.target.value})} />
              <button className="bg-indigo-600 text-white py-2 rounded col-span-2">Create Permit</button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable title="Projects" data={projects} columns={projectColumns} searchable sortable />
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DataTable title="Permits" data={permits} columns={permitsColumns} searchable sortable />
        </div>
      </div>
    </div>
  );
};

export default PlanningApprovals;


