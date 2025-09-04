import React, { useState, useEffect } from 'react';
import { Citizen, Request } from '../types';
import { getPendingRequests, db } from '../database/db';

interface ReminderWithPriority extends Request {
  citizenName: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  daysOverdue: number;
}

const Reminders: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<ReminderWithPriority[]>([]);
  const [namedays, setNamedays] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const overduePending = await getPendingRequests();
      
      const requestsWithCitizens = await Promise.all(
        overduePending.map(async (request) => {
          const citizen = await db.citizens.get(request.citizenId);
          const daysOverdue = formatDaysOverdue(request.dateSubmitted);
          
          let priority: 'critical' | 'high' | 'medium' | 'low' = 'low';
          if (daysOverdue >= 60) priority = 'critical';
          else if (daysOverdue >= 40) priority = 'high';
          else if (daysOverdue >= 25) priority = 'medium';
          
          return {
            ...request,
            citizenName: citizen ? `${citizen.surname} ${citizen.name}` : 'Άγνωστος',
            priority,
            daysOverdue
          } as ReminderWithPriority;
        })
      );
      
      // Sort by priority and days overdue
      requestsWithCitizens.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.daysOverdue - a.daysOverdue;
      });
      
      setPendingRequests(requestsWithCitizens);

      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingNamedays = await db.citizens
        .filter(citizen => {
          if (!citizen.nameDay) return false;
          
          const nameDay = new Date(citizen.nameDay);
          const thisYearNameday = new Date(today.getFullYear(), nameDay.getMonth(), nameDay.getDate());
          
          if (thisYearNameday < today) {
            thisYearNameday.setFullYear(today.getFullYear() + 1);
          }
          
          return thisYearNameday >= today && thisYearNameday <= nextWeek;
        })
        .toArray();
      
      setNamedays(upcomingNamedays);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDaysOverdue = (dateSubmitted: string): number => {
    const submitted = new Date(dateSubmitted);
    const today = new Date();
    const diffTime = today.getTime() - submitted.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatNamedayDate = (nameDay: string): string => {
    const date = new Date(nameDay);
    const today = new Date();
    const thisYearNameday = new Date(today.getFullYear(), date.getMonth(), date.getDate());
    
    if (thisYearNameday < today) {
      thisYearNameday.setFullYear(today.getFullYear() + 1);
    }
    
    return thisYearNameday.toLocaleDateString('el-GR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'from-red-600 to-red-700';
      case 'high': return 'from-orange-600 to-orange-700';
      case 'medium': return 'from-yellow-600 to-yellow-700';
      default: return 'from-blue-600 to-blue-700';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'high':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const filteredRequests = filter === 'all' 
    ? pendingRequests 
    : pendingRequests.filter(req => req.priority === filter);

  const priorityCounts = {
    critical: pendingRequests.filter(req => req.priority === 'critical').length,
    high: pendingRequests.filter(req => req.priority === 'high').length,
    medium: pendingRequests.filter(req => req.priority === 'medium').length,
    low: pendingRequests.filter(req => req.priority === 'low').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Φόρτωση υπενθυμίσεων...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔔 Υπενθυμίσεις</h1>
            <p className="text-slate-300">Διαχείριση εκκρεμών αιτημάτων και σημαντικών ημερομηνιών</p>
          </div>
          <button 
            onClick={loadReminders} 
            className="glass-card hover-lift px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Ανανέωση
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="glass-card rounded-xl p-4 animate-fade-in">
            <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
            <div className="text-slate-300 text-sm">Σύνολο Εκκρεμών</div>
          </div>
          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="text-2xl font-bold text-red-400">{priorityCounts.critical}</div>
            <div className="text-slate-300 text-sm">Κρίσιμα</div>
          </div>
          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="text-2xl font-bold text-orange-400">{priorityCounts.high}</div>
            <div className="text-slate-300 text-sm">Υψηλής Προτ.</div>
          </div>
          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="text-2xl font-bold text-yellow-400">{priorityCounts.medium}</div>
            <div className="text-slate-300 text-sm">Μέσης Προτ.</div>
          </div>
          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="text-2xl font-bold text-blue-400">{priorityCounts.low}</div>
            <div className="text-slate-300 text-sm">Χαμηλής Προτ.</div>
          </div>
          <div className="glass-card rounded-xl p-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <div className="text-2xl font-bold text-green-400">{namedays.length}</div>
            <div className="text-slate-300 text-sm">Εορτές</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-2xl p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-danger rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Εκκρεμή Αιτήματα</h3>
                </div>
                
                {/* Priority Filter */}
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'Όλα', color: 'bg-slate-600' },
                    { key: 'critical', label: 'Κρίσιμα', color: 'bg-red-600' },
                    { key: 'high', label: 'Υψηλά', color: 'bg-orange-600' },
                    { key: 'medium', label: 'Μέσα', color: 'bg-yellow-600' },
                    { key: 'low', label: 'Χαμηλά', color: 'bg-blue-600' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setFilter(option.key as any)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                        filter === option.key 
                          ? `${option.color} text-white` 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-300 text-lg">
                    {filter === 'all' 
                      ? 'Δεν υπάρχουν εκκρεμή αιτήματα!' 
                      : `Δεν υπάρχουν αιτήματα με ${filter} προτεραιότητα`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredRequests.map((request, index) => (
                    <div 
                      key={request.id} 
                      className="dark-card rounded-xl p-4 hover-lift transition-all duration-300"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 bg-gradient-to-r ${getPriorityColor(request.priority)} rounded-lg flex items-center justify-center`}>
                              {getPriorityIcon(request.priority)}
                            </div>
                            <div>
                              <div className="text-white font-semibold">{request.citizenName}</div>
                              <div className="text-slate-400 text-sm">{request.category}</div>
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-3 line-clamp-2">{request.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              request.priority === 'critical' ? 'bg-red-900 text-red-300' :
                              request.priority === 'high' ? 'bg-orange-900 text-orange-300' :
                              request.priority === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-blue-900 text-blue-300'
                            }`}>
                              Εκκρεμεί {request.daysOverdue} ημέρες
                            </span>
                            <span className="text-slate-400">
                              Υποβλήθηκε: {new Date(request.dateSubmitted).toLocaleDateString('el-GR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <button 
                            className="bg-gradient-primary hover:opacity-80 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200"
                            onClick={() => {
                              console.log('Navigate to citizen:', request.citizenId);
                            }}
                          >
                            Προβολή
                          </button>
                          <button 
                            className="bg-slate-600 hover:bg-slate-500 px-3 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200"
                            onClick={() => {
                              console.log('Mark as resolved:', request.id);
                            }}
                          >
                            Επίλυση
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Namedays */}
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Προσεχείς Εορτές</h3>
              </div>

              {namedays.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-300">Δεν υπάρχουν εορτές τις επόμενες 7 ημέρες</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {namedays.map((citizen, index) => (
                    <div 
                      key={citizen.id} 
                      className="dark-card rounded-xl p-4 hover-lift"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">🎉</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">
                            {citizen.surname} {citizen.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            Εορτάζει {formatNamedayDate(citizen.nameDay!)}
                          </div>
                        </div>
                      </div>
                      
                      {(citizen.phone || citizen.email) && (
                        <div className="flex items-center gap-2 mt-3">
                          {citizen.phone && (
                            <button 
                              className="bg-gradient-secondary hover:opacity-80 px-3 py-1 rounded-lg text-white text-xs font-medium transition-all duration-200 flex items-center gap-1"
                              onClick={() => window.open(`tel:${citizen.phone}`)}
                            >
                              📞 Κλήση
                            </button>
                          )}
                          {citizen.email && (
                            <button 
                              className="bg-gradient-success hover:opacity-80 px-3 py-1 rounded-lg text-white text-xs font-medium transition-all duration-200 flex items-center gap-1"
                              onClick={() => window.open(`mailto:${citizen.email}?subject=Χρόνια Πολλά!`)}
                            >
                              📧 Email
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reminders;