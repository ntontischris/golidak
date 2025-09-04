import React, { useState, useEffect } from 'react';
import { getStatistics, db } from '../database/db';

interface StatisticsData {
  totalCitizens: number;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  requestsByCategory: Array<{ category: string; count: number }>;
  citizensByRegion: Array<{ region: string; count: number }>;
  requestsByStatus: Array<{ status: string; count: number }>;
  monthlyTrends: Array<{ month: string; count: number }>;
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData>({
    totalCitizens: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    requestsByCategory: [],
    citizensByRegion: [],
    requestsByStatus: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const basicStats = await getStatistics();
      
      const requestsByCategory = await db.requests
        .orderBy('category')
        .toArray()
        .then(requests => {
          const categories = requests.reduce((acc, req) => {
            acc[req.category] = (acc[req.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(categories).map(([category, count]) => ({ category, count }));
        });

      const citizensByRegion = await db.citizens
        .orderBy('region')
        .toArray()
        .then(citizens => {
          const regions = citizens.reduce((acc, citizen) => {
            acc[citizen.region] = (acc[citizen.region] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(regions).map(([region, count]) => ({ region, count }));
        });

      const requestsByStatus = await db.requests
        .orderBy('status')
        .toArray()
        .then(requests => {
          const statuses = requests.reduce((acc, req) => {
            acc[req.status] = (acc[req.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(statuses).map(([status, count]) => ({ status, count }));
        });

      const monthlyTrends = await db.citizens
        .orderBy('dateAdded')
        .toArray()
        .then(citizens => {
          const months = citizens.reduce((acc, citizen) => {
            const month = new Date(citizen.dateAdded).toLocaleDateString('el-GR', { 
              year: 'numeric', 
              month: 'long' 
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          return Object.entries(months)
            .map(([month, count]) => ({ month, count }))
            .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        });

      setStats({
        ...basicStats,
        requestsByCategory,
        citizensByRegion,
        requestsByStatus,
        monthlyTrends
      });
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Φόρτωση στατιστικών...</span>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalRequests > 0 
    ? ((stats.completedRequests / stats.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Στατιστικά Συστήματος</h1>
            <p className="text-slate-300">Αναλυτική παρουσίαση δεδομένων και στατιστικών</p>
          </div>
          <button 
            onClick={loadStatistics} 
            className="glass-card hover-lift px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Ανανέωση
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.totalCitizens.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Σύνολο Πολιτών</div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.totalRequests.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Σύνολο Αιτημάτων</div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.completedRequests.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Ολοκληρωμένα</div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-danger rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.pendingRequests.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Εκκρεμή</div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{completionRate}%</div>
            <div className="text-slate-300 text-sm font-medium">Ποσοστό Ολοκλήρωσης</div>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requests by Category */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Αιτήματα ανά Κατηγορία</h3>
            </div>
            <div className="space-y-4">
              {stats.requestsByCategory.map((item, index) => {
                const maxCount = Math.max(...stats.requestsByCategory.map(x => x.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">{item.category}</span>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          index % 4 === 0 ? 'bg-gradient-primary' :
                          index % 4 === 1 ? 'bg-gradient-secondary' :
                          index % 4 === 2 ? 'bg-gradient-success' : 'bg-gradient-danger'
                        }`}
                        style={{ width: `${percentage}%`, animationDelay: `${index * 0.1}s` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Citizens by Region */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Πολίτες ανά Περιοχή</h3>
            </div>
            <div className="space-y-4">
              {stats.citizensByRegion.map((item, index) => {
                const maxCount = Math.max(...stats.citizensByRegion.map(x => x.count));
                const percentage = (item.count / maxCount) * 100;
                return (
                  <div key={item.region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">{item.region}</span>
                      <span className="text-white font-bold">{item.count}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          index % 4 === 0 ? 'bg-gradient-success' :
                          index % 4 === 1 ? 'bg-gradient-primary' :
                          index % 4 === 2 ? 'bg-gradient-secondary' : 'bg-gradient-danger'
                        }`}
                        style={{ width: `${percentage}%`, animationDelay: `${index * 0.1}s` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Κατάσταση Αιτημάτων</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.requestsByStatus.map((item, index) => (
              <div key={item.status} className="dark-card rounded-xl p-4 hover-lift">
                <div className={`text-2xl font-bold mb-2 ${
                  item.status.toLowerCase().includes('ολοκλήρ') ? 'text-green-400' :
                  item.status.toLowerCase().includes('εκκρεμ') ? 'text-red-400' :
                  item.status.toLowerCase().includes('επεξεργ') ? 'text-yellow-400' :
                  'text-blue-400'
                }`}>
                  {item.count}
                </div>
                <div className="text-slate-300 text-sm font-medium">{item.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        {stats.monthlyTrends.length > 0 && (
          <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white">Τάση Εγγραφών (Τελευταίοι 6 Μήνες)</h3>
            </div>
            <div className="flex items-end justify-between space-x-2 h-48">
              {stats.monthlyTrends.slice(-6).map((item, index) => {
                const maxCount = Math.max(...stats.monthlyTrends.map(x => x.count));
                const height = (item.count / maxCount) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all duration-1000 hover:shadow-lg"
                        style={{ 
                          height: `${height * 1.5}px`,
                          animationDelay: `${index * 0.1}s`
                        }}
                      />
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white font-bold text-sm">
                        {item.count}
                      </div>
                    </div>
                    <div className="text-slate-300 text-xs mt-2 text-center font-medium">
                      {item.month.split(' ')[1]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;