import React, { useState, useEffect } from 'react';
import { Search, Users, BarChart3, Bell, Plus, UserPlus, Shield, Database } from 'lucide-react';
import { Citizen, Request, MilitaryPersonnel } from '../types';
import { db, SearchFilters } from '../database/db';
import { loadSampleData } from '../database/sampleData';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import CitizenSearch from './CitizenSearch';
import GroupingFilters from './GroupingFilters';

interface DashboardStats {
  totalCitizens: number;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  recentRegistrations: number;
  criticalRequests: number;
}

interface DashboardViewProps {
  selectedCitizen: Citizen | null;
  citizenRequests: Request[];
  militaryPersonnel: MilitaryPersonnel[];
  onSelectCitizen: (citizen: Citizen) => void;
  onShowCitizenForm: () => void;
  onShowRequestForm: () => void;
  onShowMilitaryForm: () => void;
  onEditRequest: (request: Request) => void;
  onDeleteRequest: (requestId: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  selectedCitizen,
  citizenRequests,
  militaryPersonnel,
  onSelectCitizen,
  onShowCitizenForm,
  onShowRequestForm,
  onShowMilitaryForm,
  onEditRequest,
  onDeleteRequest,
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCitizens: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    recentRegistrations: 0,
    criticalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const totalCitizens = await db.citizens.count();
      const totalRequests = await db.requests.count();
      
      const completedRequests = await db.requests
        .where('status')
        .equals('ΟΛΟΚΛΗΡΩΜΕΝΟ')
        .count();
      
      const pendingRequests = await db.requests
        .where('status')
        .equals('ΕΚΚΡΕΜΕΙ')
        .count();

      // Πρόσφατες εγγραφές (τελευταίες 30 ημέρες)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentRegistrations = await db.citizens
        .where('dateAdded')
        .above(thirtyDaysAgo.toISOString())
        .count();

      // Κρίσιμα αιτήματα (πάνω από 25 ημέρες εκκρεμότητα)
      const twentyFiveDaysAgo = new Date();
      twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
      
      const criticalRequests = await db.requests
        .where('status')
        .equals('ΕΚΚΡΕΜΕΙ')
        .filter(request => new Date(request.dateSubmitted) < twentyFiveDaysAgo)
        .count();

      setStats({
        totalCitizens,
        totalRequests,
        completedRequests,
        pendingRequests,
        recentRegistrations,
        criticalRequests,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ΟΛΟΚΛΗΡΩΜΕΝΟ':
        return 'bg-green-500 text-white';
      case 'ΕΚΚΡΕΜΕΙ':
        return 'bg-orange-500 text-white';
      case 'ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const calculatePercentageChange = (current: number, total: number): string => {
    if (total === 0) return '0';
    return ((current / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Φόρτωση dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">🏛️ Πίνακας Ελέγχου</h1>
          <p className="text-slate-300">Διαχείριση πολιτών και αιτημάτων - Κεντρικός πίνακας ελέγχου</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onShowCitizenForm()}
            className="glass-card hover-lift px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300"
          >
            <Plus className="h-5 w-5" />
            Νέος Πολίτης
          </button>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats.totalCitizens.toLocaleString()}</div>
          <div className="text-slate-300 text-sm font-medium mb-2">Σύνολο Πολιτών</div>
          <div className="flex items-center text-xs">
            <span className="text-green-400 font-medium">
              {stats.recentRegistrations} νέοι
            </span>
            <span className="text-slate-400 ml-1">τον τελευταίο μήνα</span>
          </div>
        </div>

        <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats.totalRequests.toLocaleString()}</div>
          <div className="text-slate-300 text-sm font-medium mb-2">Σύνολο Αιτημάτων</div>
          <div className="flex items-center text-xs">
            <span className="text-blue-400 font-medium">
              {((stats.totalRequests / Math.max(stats.totalCitizens, 1)) * 1).toFixed(1)} μέσος όρος
            </span>
            <span className="text-slate-400 ml-1">ανά πολίτη</span>
          </div>
        </div>

        <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats.completedRequests.toLocaleString()}</div>
          <div className="text-slate-300 text-sm font-medium mb-2">Ολοκληρωμένα</div>
          <div className="flex items-center text-xs">
            <span className="text-green-400 font-medium">
              {calculatePercentageChange(stats.completedRequests, stats.totalRequests)}%
            </span>
            <span className="text-slate-400 ml-1">επιτυχία</span>
          </div>
        </div>

        <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-danger rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats.pendingRequests.toLocaleString()}</div>
          <div className="text-slate-300 text-sm font-medium mb-2">Εκκρεμή</div>
          <div className="flex items-center text-xs">
            <span className="text-orange-400 font-medium">
              {calculatePercentageChange(stats.pendingRequests, stats.totalRequests)}%
            </span>
            <span className="text-slate-400 ml-1">του συνόλου</span>
          </div>
        </div>

        <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
              <Bell className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{stats.criticalRequests.toLocaleString()}</div>
          <div className="text-slate-300 text-sm font-medium mb-2">Κρίσιμα</div>
          <div className="flex items-center text-xs">
            <span className="text-red-400 font-medium">+25 ημέρες</span>
            <span className="text-slate-400 ml-1">εκκρεμότητα</span>
          </div>
        </div>

        <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.5s'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {stats.totalRequests > 0 ? ((stats.completedRequests / stats.totalRequests) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-slate-300 text-sm font-medium mb-2">Επιτυχία</div>
          <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000" 
              style={{ 
                width: `${stats.totalRequests > 0 ? (stats.completedRequests / stats.totalRequests) * 100 : 0}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Γρήγορες Ενέργειες</h3>
            </div>
            <div className="space-y-3">
              <Button
                onClick={onShowCitizenForm}
                className="w-full bg-gradient-primary hover:opacity-80 text-white border-0 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                Νέος Πολίτης
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (window.confirm('Θέλετε να φορτώσετε δεδομένα-παράδειγμα;')) {
                    await db.citizens.clear();
                    await db.requests.clear();
                    await db.militaryPersonnel.clear();
                    await loadSampleData();
                    await loadDashboardStats();
                  }
                }}
                className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600 transition-all duration-300"
              >
                <Database className="h-4 w-4 mr-2" />
                Δεδομένα Παραδείγματος
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <GroupingFilters onFiltersChange={setActiveFilters} />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Section */}
          <div className="glass-card rounded-2xl p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Αναζήτηση Πολιτών</h3>
                <p className="text-slate-300 text-sm mt-1">
                  Αναζήτηση με όνομα, επώνυμο, ΑΔΤ, ΑΦΜ, τηλέφωνο ή email
                </p>
              </div>
            </div>
            <CitizenSearch onSelectCitizen={onSelectCitizen} filters={activeFilters} />
          </div>

          {/* Citizen Details */}
          {selectedCitizen ? (
            <div className="glass-card rounded-2xl p-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {selectedCitizen.surname} {selectedCitizen.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className="bg-gradient-primary text-white border-0">{selectedCitizen.region}</Badge>
                    <span className="text-slate-400">•</span>
                    <span className="font-medium text-slate-300">{selectedCitizen.property}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowCitizenForm}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    Επεξεργασία
                  </Button>
                  <Button
                    size="sm"
                    onClick={onShowRequestForm}
                    className="bg-gradient-primary hover:opacity-80 border-0 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Νέο Αίτημα
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onShowMilitaryForm}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Στρατιωτικά
                  </Button>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="dark-card p-4 rounded-lg">
                  <div className="text-orange-400 text-sm font-medium mb-1">Τηλέφωνο</div>
                  <div className="text-white font-medium">{selectedCitizen.phone || '-'}</div>
                </div>
                <div className="dark-card p-4 rounded-lg">
                  <div className="text-blue-400 text-sm font-medium mb-1">Email</div>
                  <div className="text-white text-sm break-all">{selectedCitizen.email || '-'}</div>
                </div>
                <div className="dark-card p-4 rounded-lg">
                  <div className="text-purple-400 text-sm font-medium mb-1">Αρμόδιος</div>
                  <div className="text-white font-medium">{selectedCitizen.responsibleEmployee}</div>
                </div>
                <div className="dark-card p-4 rounded-lg">
                  <div className="text-green-400 text-sm font-medium mb-1">Ημερομηνία Εγγραφής</div>
                  <div className="text-white font-medium">{new Date(selectedCitizen.dateAdded).toLocaleDateString('el-GR')}</div>
                </div>
                {selectedCitizen.lastCommunication && (
                  <div className="dark-card p-4 rounded-lg">
                    <div className="text-pink-400 text-sm font-medium mb-1">Τελευταία Επικοινωνία</div>
                    <div className="text-white font-medium">{new Date(selectedCitizen.lastCommunication).toLocaleDateString('el-GR')}</div>
                  </div>
                )}
              </div>

              {/* Requests */}
              <div>
                <h4 className="font-bold text-xl mb-4 flex items-center gap-3 text-white">
                  <div className="w-3 h-3 bg-gradient-primary rounded-full"></div>
                  <span>Αιτήματα ({citizenRequests.length})</span>
                </h4>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {citizenRequests.map((request, index) => (
                    <div key={request.id} className="dark-card hover-lift p-6 rounded-xl" style={{animationDelay: `${index * 0.05}s`}}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-orange-500 text-white">{request.category}</Badge>
                          <Badge className={`${getStatusColor(request.status)} px-3 py-1 font-medium`}>
                            {request.status}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditRequest(request)}
                            className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                          >
                            Επεξεργασία
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDeleteRequest(request.id)}
                            className="bg-red-600 border-red-500 text-white hover:bg-red-500"
                          >
                            Διαγραφή
                          </Button>
                        </div>
                      </div>
                      <p className="text-slate-300 mb-4 leading-relaxed">{request.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-blue-400 font-medium">Υποβολή:</span>
                          <span className="text-slate-300">{new Date(request.dateSubmitted).toLocaleDateString('el-GR')}</span>
                        </div>
                        {request.dateSent && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span className="text-yellow-400 font-medium">Αποστολή:</span>
                            <span className="text-slate-300">{new Date(request.dateSent).toLocaleDateString('el-GR')}</span>
                          </div>
                        )}
                        {request.dateCompleted && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-green-400 font-medium">Ολοκλήρωση:</span>
                            <span className="text-slate-300">{new Date(request.dateCompleted).toLocaleDateString('el-GR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {citizenRequests.length === 0 && (
                    <div className="text-center py-12">
                      <div className="dark-card p-8 rounded-xl">
                        <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Plus className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-300 text-lg font-medium">Δεν βρέθηκαν αιτήματα</p>
                        <p className="text-slate-400 text-sm mt-2">Προσθέστε το πρώτο αίτημα για αυτόν τον πολίτη</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Military Personnel */}
              {militaryPersonnel.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold text-xl mb-4 flex items-center gap-3 text-white">
                    <div className="w-3 h-3 bg-gradient-secondary rounded-full"></div>
                    <span>Στρατιωτικές Πληροφορίες</span>
                  </h4>
                  <div className="space-y-4">
                    {militaryPersonnel.map((military, index) => (
                      <div key={military.id} className="dark-card hover-lift p-6 rounded-xl" style={{animationDelay: `${index * 0.05}s`}}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge className="bg-purple-500 text-white">{military.rank}</Badge>
                            <Badge className="bg-blue-500 text-white">{military.esso}</Badge>
                          </div>
                          {military.isPermanent && (
                            <Badge className="bg-green-500 text-white">Μόνιμος</Badge>
                          )}
                        </div>
                        <p className="text-white font-semibold mb-2">{military.serviceUnit}</p>
                        {military.desire && (
                          <p className="text-slate-300 bg-slate-600 p-3 rounded-lg mb-2">
                            <span className="text-orange-400 font-medium">Επιθυμία:</span> {military.desire}
                          </p>
                        )}
                        {military.am && (
                          <p className="text-slate-300">
                            <span className="font-medium">Αριθμός Μητρώου:</span> {military.am}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Επιλέξτε έναν πολίτη</h3>
                <p className="text-slate-400">Αναζητήστε και επιλέξτε έναν πολίτη από τα αποτελέσματα για να δείτε τις λεπτομέρειες</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;