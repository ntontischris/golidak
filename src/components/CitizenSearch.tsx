import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Citizen } from '../types';
import { searchCitizens, SearchFilters } from '../database/db';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface CitizenSearchProps {
  onSelectCitizen: (citizen: Citizen) => void;
  filters?: SearchFilters;
}

const CitizenSearch: React.FC<CitizenSearchProps> = ({ onSelectCitizen, filters = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        const results = await searchCitizens(searchTerm, filters);
        setCitizens(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Αναζήτηση πολίτη (όνομα, επώνυμο, ΑΔΤ, ΑΦΜ, τηλέφωνο, email)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 h-12 text-base"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {citizens.map((citizen, index) => (
          <div
            key={citizen.id}
            className="dark-card hover-lift cursor-pointer p-4 rounded-xl transition-all duration-300 animate-fade-in"
            style={{animationDelay: `${index * 0.05}s`}}
            onClick={() => onSelectCitizen(citizen)}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-lg text-white">
                {citizen.surname} {citizen.name}
              </h4>
              <Badge className="bg-gradient-primary text-white border-0">{citizen.region}</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Ιδιότητα:</span>
                <span className="font-medium text-white">{citizen.property}</span>
              </div>
              
              {citizen.phone && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Τηλέφωνο:</span>
                  <span className="font-medium text-white">{citizen.phone}</span>
                </div>
              )}
              
              {citizen.email && (
                <div className="flex justify-between col-span-2">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-white text-sm break-all">{citizen.email}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-slate-400">Αρμόδιος:</span>
                <span className="font-medium text-white">{citizen.responsibleEmployee}</span>
              </div>
              
              {citizen.lastCommunication && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Τελ. Επικοινωνία:</span>
                  <span className="font-medium text-white">
                    {new Date(citizen.lastCommunication).toLocaleDateString('el-GR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {citizens.length === 0 && !loading && searchTerm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-300 text-lg font-medium">Δεν βρέθηκαν αποτελέσματα</p>
            <p className="text-slate-400 text-sm mt-2">Δεν βρέθηκαν αποτελέσματα για "{searchTerm}"</p>
          </div>
        )}

        {citizens.length === 0 && !loading && !searchTerm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-300 text-lg font-medium">Ξεκινήστε την αναζήτηση</p>
            <p className="text-slate-400 text-sm mt-2">Εισάγετε όρο αναζήτησης για να δείτε αποτελέσματα</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenSearch;