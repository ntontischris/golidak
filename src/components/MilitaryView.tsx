import React, { useState, useEffect } from 'react';
import { Search, Shield, Users, BarChart3, Plus, Edit, Trash2 } from 'lucide-react';
import { MilitaryPersonnel, Citizen } from '../types';
import { db } from '../database/db';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface MilitaryStats {
  totalPersonnel: number;
  permanentPersonnel: number;
  contractPersonnel: number;
  activeESSOs: number;
  totalCitizensWithMilitary: number;
}

interface MilitaryPersonnelWithCitizen extends MilitaryPersonnel {
  citizenName: string;
  citizenPhone?: string;
}

const MilitaryView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [militaryPersonnel, setMilitaryPersonnel] = useState<MilitaryPersonnelWithCitizen[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<MilitaryPersonnelWithCitizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MilitaryStats>({
    totalPersonnel: 0,
    permanentPersonnel: 0,
    contractPersonnel: 0,
    activeESSOs: 0,
    totalCitizensWithMilitary: 0,
  });
  const [filterType, setFilterType] = useState<'all' | 'permanent' | 'contract'>('all');

  useEffect(() => {
    loadMilitaryData();
  }, []);

  useEffect(() => {
    performSearch();
  }, [searchTerm, militaryPersonnel, filterType]);

  const loadMilitaryData = async () => {
    setLoading(true);
    try {
      // Φόρτωση όλου του στρατιωτικού προσωπικού
      const allMilitary = await db.militaryPersonnel.toArray();
      
      // Φόρτωση πληροφοριών πολιτών
      const militaryWithCitizens = await Promise.all(
        allMilitary.map(async (military) => {
          const citizen = await db.citizens.get(military.citizenId);
          return {
            ...military,
            citizenName: citizen ? `${citizen.surname} ${citizen.name}` : 'Άγνωστος',
            citizenPhone: citizen?.phone
          } as MilitaryPersonnelWithCitizen;
        })
      );

      setMilitaryPersonnel(militaryWithCitizens);
      
      // Υπολογισμός στατιστικών
      const totalPersonnel = militaryWithCitizens.length;
      const permanentPersonnel = militaryWithCitizens.filter(m => m.isPermanent).length;
      const contractPersonnel = totalPersonnel - permanentPersonnel;
      
      // Μοναδικά ESSO
      const uniqueESSOs = new Set(militaryWithCitizens.map(m => m.esso)).size;
      
      // Μοναδικοί πολίτες με στρατιωτικές πληροφορίες
      const uniqueCitizens = new Set(militaryWithCitizens.map(m => m.citizenId)).size;

      setStats({
        totalPersonnel,
        permanentPersonnel,
        contractPersonnel,
        activeESSOs: uniqueESSOs,
        totalCitizensWithMilitary: uniqueCitizens,
      });
    } catch (error) {
      console.error('Error loading military data:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    let filtered = militaryPersonnel;

    // Φιλτράρισμα βάσει τύπου
    if (filterType === 'permanent') {
      filtered = filtered.filter(m => m.isPermanent);
    } else if (filterType === 'contract') {
      filtered = filtered.filter(m => !m.isPermanent);
    }

    // Αναζήτηση
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(military => 
        military.esso?.toLowerCase().includes(searchLower) ||
        military.citizenName.toLowerCase().includes(searchLower) ||
        military.rank?.toLowerCase().includes(searchLower) ||
        military.serviceUnit?.toLowerCase().includes(searchLower) ||
        military.am?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPersonnel(filtered);
  };

  const handleDeleteMilitary = async (id: string) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτές τις στρατιωτικές πληροφορίες;')) {
      try {
        await db.militaryPersonnel.delete(id);
        await loadMilitaryData();
      } catch (error) {
        console.error('Error deleting military personnel:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <span className="text-white text-lg">Φόρτωση στρατιωτικών δεδομένων...</span>
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
            <h1 className="text-4xl font-bold text-white mb-2">🪖 Στρατιωτικό Προσωπικό</h1>
            <p className="text-slate-300">Διαχείριση και παρακολούθηση στρατιωτικού προσωπικού και ΕΣΣΟ</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadMilitaryData}
              className="glass-card hover-lift px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300"
            >
              <BarChart3 className="h-5 w-5" />
              Ανανέωση
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.totalPersonnel.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Σύνολο Προσωπικού</div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-success rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.permanentPersonnel.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Μόνιμοι</div>
            <div className="flex items-center text-xs mt-2">
              <span className="text-green-400 font-medium">
                {stats.totalPersonnel > 0 ? ((stats.permanentPersonnel / stats.totalPersonnel) * 100).toFixed(1) : '0'}%
              </span>
              <span className="text-slate-400 ml-1">του συνόλου</span>
            </div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.contractPersonnel.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Συμβασιούχοι</div>
            <div className="flex items-center text-xs mt-2">
              <span className="text-blue-400 font-medium">
                {stats.totalPersonnel > 0 ? ((stats.contractPersonnel / stats.totalPersonnel) * 100).toFixed(1) : '0'}%
              </span>
              <span className="text-slate-400 ml-1">του συνόλου</span>
            </div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-danger rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.activeESSOs.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Ενεργά ΕΣΣΟ</div>
          </div>

          <div className="glass-card hover-lift rounded-2xl p-6 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{stats.totalCitizensWithMilitary.toLocaleString()}</div>
            <div className="text-slate-300 text-sm font-medium">Πολίτες με Στρατ. Στοιχεία</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="glass-card rounded-2xl p-6 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Αναζήτηση με ΕΣΣΟ, όνομα, βαθμό, μονάδα..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Όλοι', color: 'bg-slate-600' },
                { key: 'permanent', label: 'Μόνιμοι', color: 'bg-green-600' },
                { key: 'contract', label: 'Συμβασιούχοι', color: 'bg-blue-600' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setFilterType(option.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    filterType === option.key 
                      ? `${option.color} text-white` 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {filteredPersonnel.length === 0 ? (
            <div className="glass-card rounded-2xl p-8">
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? 'Δεν βρέθηκαν αποτελέσματα' : 'Δεν υπάρχουν στρατιωτικές καταχωρίσεις'}
                </h3>
                <p className="text-slate-400">
                  {searchTerm 
                    ? `Δεν βρέθηκαν αποτελέσματα για "${searchTerm}"`
                    : 'Προσθέστε στρατιωτικές πληροφορίες μέσω της σελίδας πολιτών'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPersonnel.map((military, index) => (
                <div 
                  key={military.id} 
                  className="glass-card hover-lift rounded-xl p-6 animate-fade-in transition-all duration-300"
                  style={{animationDelay: `${index * 0.05}s`}}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{military.citizenName}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={`${military.isPermanent ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                              {military.isPermanent ? 'Μόνιμος' : 'Συμβασιούχος'}
                            </Badge>
                            <Badge className="bg-purple-600 text-white">{military.rank}</Badge>
                            <Badge className="bg-orange-600 text-white">ΕΣΣΟ: {military.esso}</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="dark-card p-3 rounded-lg">
                          <div className="text-blue-400 text-xs font-medium mb-1">Μονάδα Υπηρεσίας</div>
                          <div className="text-white text-sm font-medium">{military.serviceUnit}</div>
                        </div>
                        
                        {military.am && (
                          <div className="dark-card p-3 rounded-lg">
                            <div className="text-green-400 text-xs font-medium mb-1">Αριθμός Μητρώου</div>
                            <div className="text-white text-sm font-medium">{military.am}</div>
                          </div>
                        )}
                        
                        {military.citizenPhone && (
                          <div className="dark-card p-3 rounded-lg">
                            <div className="text-orange-400 text-xs font-medium mb-1">Τηλέφωνο</div>
                            <div className="text-white text-sm font-medium">{military.citizenPhone}</div>
                          </div>
                        )}

                        <div className="dark-card p-3 rounded-lg">
                          <div className="text-purple-400 text-xs font-medium mb-1">ΕΣΣΟ</div>
                          <div className="text-white text-sm font-medium">{military.esso}</div>
                        </div>
                      </div>

                      {military.desire && (
                        <div className="dark-card p-4 rounded-lg mb-4">
                          <div className="text-yellow-400 text-sm font-medium mb-2">Επιθυμία Τοποθέτησης</div>
                          <p className="text-slate-300 text-sm">{military.desire}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log('Edit military:', military.id)}
                        className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Επεξεργασία
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMilitary(military.id)}
                        className="bg-red-600 border-red-500 text-white hover:bg-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Διαγραφή
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredPersonnel.length > 0 && (
          <div className="glass-card rounded-2xl p-4 animate-slide-up">
            <div className="flex items-center justify-between text-slate-300">
              <span>
                Εμφάνιση {filteredPersonnel.length} από {stats.totalPersonnel} σύνολο στρατιωτικών καταχωρίσεων
              </span>
              {searchTerm && (
                <span className="text-sm">
                  Αναζήτηση: "<span className="text-white font-medium">{searchTerm}</span>"
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilitaryView;