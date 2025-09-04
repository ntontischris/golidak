import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X, RotateCcw } from 'lucide-react';
import { ContactCategory, RequestCategory, RequestStatus, Region } from '../types';
import { SearchFilters } from '../database/db';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface GroupingFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
}

const GroupingFilters: React.FC<GroupingFiltersProps> = ({ onFiltersChange }) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [activeSection, setActiveSection] = useState<string>('');

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <Card className="w-full glass-card animate-fade-in">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg font-bold text-white">Φίλτρα</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-400 hover:text-white hover:bg-slate-700 text-xs"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Καθαρισμός
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Filters Section */}
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between px-3 py-2 text-left text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
            onClick={() => toggleSection('basic')}
          >
            <span className="font-medium">Βασικά Φίλτρα</span>
            {activeSection === 'basic' ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {activeSection === 'basic' && (
            <div className="space-y-3 pl-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Περιοχή</label>
                <select
                  value={filters.region || ''}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 [&>option]:bg-slate-800 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="">Όλες οι περιοχές</option>
                  <option value="Α ΘΕΣΣΑΛΟΝΙΚΗΣ">Α ΘΕΣΣΑΛΟΝΙΚΗΣ</option>
                  <option value="Β ΘΕΣΣΑΛΟΝΙΚΗΣ">Β ΘΕΣΣΑΛΟΝΙΚΗΣ</option>
                  <option value="ΑΛΛΟ">ΑΛΛΟ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Κατηγορία Επαφής</label>
                <select
                  value={filters.contactCategory || ''}
                  onChange={(e) => handleFilterChange('contactCategory', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 [&>option]:bg-slate-800 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="">Όλες οι κατηγορίες</option>
                  <option value="GDPR">GDPR</option>
                  <option value="ΑΙΤΗΜΑ">ΑΙΤΗΜΑ</option>
                  <option value="GDPR ΚΑΙ ΑΙΤΗΜΑ">GDPR ΚΑΙ ΑΙΤΗΜΑ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ιδιότητα</label>
                <Input
                  type="text"
                  placeholder="π.χ. Δημόσιος Υπάλληλος"
                  value={filters.property || ''}
                  onChange={(e) => handleFilterChange('property', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 text-sm focus:ring-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Αρμόδιος Συνεργάτης</label>
                <Input
                  type="text"
                  placeholder="Όνομα συνεργάτη"
                  value={filters.responsibleEmployee || ''}
                  onChange={(e) => handleFilterChange('responsibleEmployee', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 text-sm focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Date Filters Section */}
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between px-3 py-2 text-left text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
            onClick={() => toggleSection('dates')}
          >
            <span className="font-medium">Ημερομηνίες</span>
            {activeSection === 'dates' ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {activeSection === 'dates' && (
            <div className="space-y-4 pl-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ημερομηνία Προσθήκης Επαφής</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.dateAddedFrom || ''}
                    onChange={(e) => handleFilterChange('dateAddedFrom', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white text-sm focus:ring-orange-500"
                  />
                  <div className="flex items-center text-xs text-gray-400">
                    <span className="px-2">έως</span>
                  </div>
                  <Input
                    type="date"
                    value={filters.dateAddedTo || ''}
                    onChange={(e) => handleFilterChange('dateAddedTo', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white text-sm focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ημερομηνία Ολοκλήρωσης</label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    value={filters.dateCompletedFrom || ''}
                    onChange={(e) => handleFilterChange('dateCompletedFrom', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white text-sm focus:ring-orange-500"
                  />
                  <div className="flex items-center text-xs text-gray-400">
                    <span className="px-2">έως</span>
                  </div>
                  <Input
                    type="date"
                    value={filters.dateCompletedTo || ''}
                    onChange={(e) => handleFilterChange('dateCompletedTo', e.target.value)}
                    className="bg-slate-800 border-slate-600 text-white text-sm focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Request Filters Section */}
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between px-3 py-2 text-left text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
            onClick={() => toggleSection('requests')}
          >
            <span className="font-medium">Αιτήματα</span>
            {activeSection === 'requests' ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {activeSection === 'requests' && (
            <div className="space-y-3 pl-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Κατηγορία Αιτήματος</label>
                <select
                  value={filters.requestCategory || ''}
                  onChange={(e) => handleFilterChange('requestCategory', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 [&>option]:bg-slate-800 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="">Όλες οι κατηγορίες</option>
                  <option value="ΣΤΡΑΤΙΩΤΙΚΟ">ΣΤΡΑΤΙΩΤΙΚΟ</option>
                  <option value="ΙΑΤΡΙΚΟ">ΙΑΤΡΙΚΟ</option>
                  <option value="ΑΣΤΥΝΟΜΙΚΟ">ΑΣΤΥΝΟΜΙΚΟ</option>
                  <option value="ΠΥΡΟΣΒΕΣΤΙΚΗ">ΠΥΡΟΣΒΕΣΤΙΚΗ</option>
                  <option value="ΠΑΙΔΕΙΑΣ">ΠΑΙΔΕΙΑΣ</option>
                  <option value="ΔΙΟΙΚΗΤΙΚΟ">ΔΙΟΙΚΗΤΙΚΟ</option>
                  <option value="ΕΥΡΕΣΗ ΕΡΓΑΣΙΑΣ">ΕΥΡΕΣΗ ΕΡΓΑΣΙΑΣ</option>
                  <option value="ΕΦΚΑ">ΕΦΚΑ</option>
                  <option value="ΑΛΛΟ">ΑΛΛΟ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Κατάσταση</label>
                <select
                  value={filters.requestStatus || ''}
                  onChange={(e) => handleFilterChange('requestStatus', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 [&>option]:bg-slate-800 [&>option]:text-white [&>option]:py-2"
                >
                  <option value="">Όλες οι καταστάσεις</option>
                  <option value="ΟΛΟΚΛΗΡΩΜΕΝΟ">ΟΛΟΚΛΗΡΩΜΕΝΟ</option>
                  <option value="ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ">ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ</option>
                  <option value="ΕΚΚΡΕΜΕΙ">ΕΚΚΡΕΜΕΙ</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Military Filters Section */}
        <div className="space-y-3">
          <button 
            className="w-full flex items-center justify-between px-3 py-2 text-left text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
            onClick={() => toggleSection('military')}
          >
            <span className="font-medium">Στρατιωτικά</span>
            {activeSection === 'military' ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
          
          {activeSection === 'military' && (
            <div className="space-y-3 pl-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">ΕΣΣΟ</label>
                <Input
                  type="text"
                  placeholder="π.χ. 2025Α"
                  value={filters.esso || ''}
                  onChange={(e) => handleFilterChange('esso', e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-gray-400 text-sm focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {Object.entries(filters).filter(([_, value]) => value).length > 0 && (
          <div className="pt-4 border-t border-slate-600">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300">Ενεργά Φίλτρα:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value && (
                    <Badge 
                      key={key} 
                      variant="secondary" 
                      className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs flex items-center gap-1"
                    >
                      <span>{getFilterLabel(key)}: {value}</span>
                      <button 
                        onClick={() => handleFilterChange(key as keyof SearchFilters, '')}
                        className="ml-1 hover:bg-orange-500/30 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getFilterLabel = (key: string): string => {
  const labels: Record<string, string> = {
    region: 'Περιοχή',
    contactCategory: 'Κατηγορία Επαφής',
    property: 'Ιδιότητα',
    dateAddedFrom: 'Από Ημ/νία',
    dateAddedTo: 'Έως Ημ/νία',
    responsibleEmployee: 'Αρμόδιος',
    requestCategory: 'Κατηγορία Αιτήματος',
    requestStatus: 'Κατάσταση',
    dateCompletedFrom: 'Ολοκλήρωση Από',
    dateCompletedTo: 'Ολοκλήρωση Έως',
    esso: 'ΕΣΣΟ'
  };
  return labels[key] || key;
};

export default GroupingFilters;