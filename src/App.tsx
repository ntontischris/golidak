import React, { useState, useEffect } from 'react';
import { Search, Users, BarChart3, Bell, Plus, UserPlus, Shield, Database } from 'lucide-react';
import { Citizen, Request, MilitaryPersonnel } from './types';
import { initializeDatabase, db } from './database/db';
import { loadSampleData } from './database/sampleData';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import CitizenSearch from './components/CitizenSearch';
import CitizenForm from './components/CitizenForm';
import RequestForm from './components/RequestForm';
import MilitaryForm from './components/MilitaryForm';
import GroupingFilters from './components/GroupingFilters';
import Statistics from './components/Statistics';
import Reminders from './components/Reminders';
import DashboardView from './components/DashboardView';
import MilitaryView from './components/MilitaryView';

type View = 'search' | 'statistics' | 'reminders' | 'military';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('search');
  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [citizenRequests, setCitizenRequests] = useState<Request[]>([]);
  const [militaryPersonnel, setMilitaryPersonnel] = useState<MilitaryPersonnel[]>([]);
  
  const [showCitizenForm, setShowCitizenForm] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showMilitaryForm, setShowMilitaryForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<Request | undefined>();

  useEffect(() => {
    const initApp = async () => {
      await initializeDatabase();
      await loadSampleData();
    };
    initApp();
  }, []);

  useEffect(() => {
    if (selectedCitizen) {
      loadCitizenData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCitizen]);

  const loadCitizenData = async () => {
    if (!selectedCitizen) return;

    try {
      const requests = await db.requests
        .where('citizenId')
        .equals(selectedCitizen.id)
        .toArray();
      setCitizenRequests(requests);

      const military = await db.militaryPersonnel
        .where('citizenId')
        .equals(selectedCitizen.id)
        .toArray();
      setMilitaryPersonnel(military);
    } catch (error) {
      console.error('Error loading citizen data:', error);
    }
  };

  const handleSelectCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
  };

  const handleSaveCitizen = (citizen: Citizen) => {
    setSelectedCitizen(citizen);
    setShowCitizenForm(false);
  };

  const handleSaveRequest = (request: Request) => {
    loadCitizenData();
    setShowRequestForm(false);
    setEditingRequest(undefined);
  };

  const handleSaveMilitary = (military: MilitaryPersonnel) => {
    loadCitizenData();
    setShowMilitaryForm(false);
  };

  const handleEditRequest = (request: Request) => {
    setEditingRequest(request);
    setShowRequestForm(true);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το αίτημα;')) {
      try {
        await db.requests.delete(requestId);
        loadCitizenData();
      } catch (error) {
        console.error('Error deleting request:', error);
      }
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

  return (
    <div className="dark min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="sidebar w-64 min-h-screen flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl gradient-primary">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FlowFast</h1>
              <p className="text-xs text-gray-400">Citizen Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4">
          <div className="space-y-2">
            <button
              onClick={() => setCurrentView('search')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'search' 
                  ? 'gradient-primary text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Search className="h-5 w-5" />
              <span>Πίνακας Ελέγχου</span>
            </button>
            <button
              onClick={() => setCurrentView('military')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'military'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Shield className="h-5 w-5" />
              <span>Στρατιωτικό Προσωπικό</span>
            </button>
            <button
              onClick={() => setCurrentView('statistics')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'statistics'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Στατιστικά</span>
            </button>
            <button
              onClick={() => setCurrentView('reminders')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                currentView === 'reminders'
                  ? 'gradient-primary text-white shadow-lg'
                  : 'text-gray-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Bell className="h-5 w-5" />
              <span>Υπενθυμίσεις</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">

        {currentView === 'search' && (
          <DashboardView
            selectedCitizen={selectedCitizen}
            citizenRequests={citizenRequests}
            militaryPersonnel={militaryPersonnel}
            onSelectCitizen={handleSelectCitizen}
            onShowCitizenForm={() => setShowCitizenForm(true)}
            onShowRequestForm={() => setShowRequestForm(true)}
            onShowMilitaryForm={() => setShowMilitaryForm(true)}
            onEditRequest={handleEditRequest}
            onDeleteRequest={handleDeleteRequest}
          />
        )}

        {currentView === 'military' && <MilitaryView />}

        {currentView === 'statistics' && <Statistics />}
        {currentView === 'reminders' && <Reminders />}
      </main>

      {/* Modals */}
      {showCitizenForm && (
        <CitizenForm
          citizen={selectedCitizen || undefined}
          onSave={handleSaveCitizen}
          onCancel={() => setShowCitizenForm(false)}
        />
      )}

      {showRequestForm && selectedCitizen && (
        <RequestForm
          citizenId={selectedCitizen.id}
          request={editingRequest}
          onSave={handleSaveRequest}
          onCancel={() => {
            setShowRequestForm(false);
            setEditingRequest(undefined);
          }}
        />
      )}

      {showMilitaryForm && selectedCitizen && (
        <MilitaryForm
          citizenId={selectedCitizen.id}
          onSave={handleSaveMilitary}
          onCancel={() => setShowMilitaryForm(false)}
        />
      )}
    </div>
  );
};

export default App;