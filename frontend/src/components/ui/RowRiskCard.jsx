import React from 'react';
import { AlertTriangle, TrendingUp, MapPin, Shield, Clock, DollarSign } from 'lucide-react';

const RowRiskCard = ({ riskData, projectName, location, budget, status }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'High': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'Medium': return <Shield className="h-5 w-5 text-yellow-600" />;
      case 'Low': return <Shield className="h-5 w-5 text-green-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRiskFactors = () => {
    if (!riskData?.risk_factors) return [];
    
    const factors = Object.entries(riskData.risk_factors)
      .map(([key, value]) => ({
        name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        score: value,
        level: value >= 75 ? 'High' : value >= 50 ? 'Medium' : 'Low'
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4); // Show top 4 factors
    
    return factors;
  };

  const riskFactors = getRiskFactors();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getRiskIcon(riskData?.risk_level)}
          <h3 className="text-lg font-semibold text-gray-900">RoW Risk Assessment</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(riskData?.risk_level)}`}>
          {riskData?.risk_level || 'Unknown'}
        </div>
      </div>

      <div className="space-y-4">
        {/* Project Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span className="font-medium">{projectName}</span>
          <span>•</span>
          <span>{location}</span>
        </div>

        {/* Risk Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Risk Score</span>
          <div className="flex items-center gap-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  riskData?.risk_score >= 75 ? 'bg-red-500' : 
                  riskData?.risk_score >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${riskData?.risk_score || 0}%` }}
              ></div>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {riskData?.risk_score || 0}/100
            </span>
          </div>
        </div>

        {/* Budget Impact */}
        {budget && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Project Budget</span>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-900">
                ₹{(parseInt(budget) / 1000000).toFixed(1)}M
              </span>
            </div>
          </div>
        )}

        {/* Status */}
        {status && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'IN PROGRESS' ? 'bg-blue-100 text-blue-800' :
              status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {status}
            </span>
          </div>
        )}

        {/* Top Risk Factors */}
        {riskFactors.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-800 mb-3">Top Risk Factors</h4>
            <div className="space-y-2">
              {riskFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">{factor.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          factor.level === 'High' ? 'bg-red-500' : 
                          factor.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${factor.score}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-900 w-8 text-right">
                      {factor.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Mitigation Suggestions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Mitigation Suggestions</h4>
          <div className="text-xs text-gray-600 space-y-1">
            {riskData?.risk_level === 'High' && (
              <>
                <p>• Engage with local communities early</p>
                <p>• Consider alternative routes</p>
                <p>• Prepare for extended timelines</p>
              </>
            )}
            {riskData?.risk_level === 'Medium' && (
              <>
                <p>• Conduct detailed surveys</p>
                <p>• Plan stakeholder consultations</p>
                <p>• Monitor local sentiment</p>
              </>
            )}
            {riskData?.risk_level === 'Low' && (
              <>
                <p>• Standard clearance procedures</p>
                <p>• Regular progress monitoring</p>
                <p>• Maintain good relations</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RowRiskCard;
