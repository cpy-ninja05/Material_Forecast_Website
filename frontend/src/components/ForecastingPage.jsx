import React, { useState } from 'react';
import { Calculator, TrendingUp, Package, MapPin, AlertCircle } from 'lucide-react';
import axios from 'axios';

const ForecastingPage = () => {
  const [formData, setFormData] = useState({
    project_location: 'North',
    tower_type: 'Tension',
    substation_type: '132 kV AIS',
    region_risk_flag: 'Low',
    budget: 30000000,
    project_size_km: 100
  });

  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const locationOptions = ['North', 'South', 'East', 'West', 'Central'];
  const towerTypeOptions = ['Tension', 'Transposition', 'Terminal', 'Suspension'];
  const substationTypeOptions = ['132 kV AIS', '132 kV GIS', '220 kV AIS', '400 kV GIS'];
  const riskOptions = ['Low', 'Medium', 'High'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPredictions(null);

    try {
      const response = await axios.post('http://localhost:5000/api/forecast', formData);
      setPredictions(response.data.predictions);
    } catch (err) {
      setError(err.response?.data?.error || 'Forecasting failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'project_size_km' ? Number(value) : value
    }));
  };

  const formatMaterialName = (name) => {
    return name
      .replace('quantity_', '')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (value, unit) => {
    if (unit === 'tons') {
      return `${value.toFixed(2)} tons`;
    } else if (unit === 'count') {
      return `${Math.round(value)} units`;
    }
    return value.toFixed(2);
  };

  const getUnit = (materialName) => {
    if (materialName.includes('tons')) return 'tons';
    if (materialName.includes('count')) return 'count';
    return '';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Calculator className="h-8 w-8 mr-3 text-indigo-600" />
          Material Demand Forecasting
        </h1>
        <p className="text-gray-600 mt-1">
          Predict material requirements for your power grid projects
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 mr-2 text-blue-600" />
            Project Parameters
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Location
              </label>
              <select
                name="project_location"
                value={formData.project_location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {locationOptions.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tower Type
              </label>
              <select
                name="tower_type"
                value={formData.tower_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {towerTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Substation Type
              </label>
              <select
                name="substation_type"
                value={formData.substation_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {substationTypeOptions.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Level
              </label>
              <select
                name="region_risk_flag"
                value={formData.region_risk_flag}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {riskOptions.map(risk => (
                  <option key={risk} value={risk}>{risk}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="1000000"
                max="500000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter exact budget amount (₹1M - ₹500M)"
              />
              <div className="mt-1 text-xs text-gray-500">
                Any value from ₹1M to ₹500M | Typical: ₹5M - ₹70M | Suggested: ₹30M
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, budget: 10000000 }))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  ₹10M
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, budget: 30000000 }))}
                  className="px-2 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 rounded"
                >
                  ₹30M
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, budget: 50000000 }))}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
                >
                  ₹50M
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Size (km)
              </label>
              <input
                type="number"
                name="project_size_km"
                value={formData.project_size_km}
                onChange={handleChange}
                min="10"
                max="500"
                step="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter project size"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Forecasting...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Forecast
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Forecasted Material Requirements
          </h2>

          {predictions ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                <p className="font-medium">Forecast generated successfully!</p>
                <p className="text-sm">Based on your project parameters</p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {Object.entries(predictions).map(([material, value]) => (
                  <div key={material} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                      {formatMaterialName(material)}
                    </span>
                    <span className="font-bold text-indigo-600">
                      {formatValue(value, getUnit(material))}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Procurement Recommendations:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Plan procurement 45-60 days in advance</li>
                  <li>• Consider bulk purchasing for cost optimization</li>
                  <li>• Monitor commodity price index for timing</li>
                  <li>• Account for lead time variations by region</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter project parameters and click "Generate Forecast" to see material requirements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForecastingPage;
