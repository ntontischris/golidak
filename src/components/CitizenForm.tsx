import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Citizen, Region } from '../types';
import { db } from '../database/db';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface CitizenFormProps {
  citizen?: Citizen;
  onSave: (citizen: Citizen) => void;
  onCancel: () => void;
}

const CitizenForm: React.FC<CitizenFormProps> = ({ citizen, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Citizen>>({
    name: '',
    surname: '',
    fatherName: '',
    motherName: '',
    birthDate: '',
    idNumber: '',
    afm: '',
    phone: '',
    email: '',
    address: '',
    region: 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ',
    property: '',
    responsibleEmployee: '',
    nameDay: '',
    notes: '',
    communicationDates: []
  });

  useEffect(() => {
    if (citizen) {
      setFormData(citizen);
    }
  }, [citizen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const citizenData: Citizen = {
      id: citizen?.id || `citizen-${Date.now()}`,
      name: formData.name!,
      surname: formData.surname!,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      birthDate: formData.birthDate,
      idNumber: formData.idNumber,
      afm: formData.afm,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      region: formData.region as Region,
      property: formData.property!,
      dateAdded: citizen?.dateAdded || new Date().toISOString(),
      responsibleEmployee: formData.responsibleEmployee!,
      nameDay: formData.nameDay,
      notes: formData.notes,
      lastCommunication: formData.lastCommunication,
      communicationDates: formData.communicationDates || []
    };

    try {
      if (citizen) {
        await db.citizens.update(citizen.id, citizenData);
      } else {
        await db.citizens.add(citizenData);
      }
      onSave(citizenData);
    } catch (error) {
      console.error('Error saving citizen:', error);
    }
  };

  const addCommunicationDate = () => {
    const newDate = new Date().toISOString();
    setFormData(prev => ({
      ...prev,
      communicationDates: [...(prev.communicationDates || []), newDate],
      lastCommunication: newDate
    }));
  };

  const removeCommunicationDate = (index: number) => {
    const newDates = [...(formData.communicationDates || [])];
    newDates.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      communicationDates: newDates,
      lastCommunication: newDates.length > 0 ? newDates[newDates.length - 1] : undefined
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden glass-card animate-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white">
              {citizen ? 'Επεξεργασία Πολίτη' : 'Νέος Πολίτης'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-gray-400 hover:text-white hover:bg-slate-700/50 rounded-full p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[70vh] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Όνομα *</label>
                <Input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Επώνυμο *</label>
                <Input
                  type="text"
                  value={formData.surname || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Όνομα Πατρός</label>
                <Input
                  type="text"
                  value={formData.fatherName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Όνομα Μητρός</label>
                <Input
                  type="text"
                  value={formData.motherName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ημερομηνία Γέννησης</label>
                <Input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Αριθμός Δελτίου Ταυτότητας</label>
                <Input
                  type="text"
                  value={formData.idNumber || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">ΑΦΜ</label>
                <Input
                  type="text"
                  value={formData.afm || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, afm: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Τηλέφωνο</label>
                <Input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Διεύθυνση</label>
              <Input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Περιοχή *</label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as Region }))}
                  required
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Α ΘΕΣΣΑΛΟΝΙΚΗΣ">Α ΘΕΣΣΑΛΟΝΙΚΗΣ</option>
                  <option value="Β ΘΕΣΣΑΛΟΝΙΚΗΣ">Β ΘΕΣΣΑΛΟΝΙΚΗΣ</option>
                  <option value="ΑΛΛΟ">ΑΛΛΟ</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ιδιότητα *</label>
                <Input
                  type="text"
                  value={formData.property || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, property: e.target.value }))}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Αρμόδιος Συνεργάτης *</label>
                <Input
                  type="text"
                  value={formData.responsibleEmployee || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, responsibleEmployee: e.target.value }))}
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Ημέρα Εορτής</label>
                <Input
                  type="date"
                  value={formData.nameDay || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameDay: e.target.value }))}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Παρατηρήσεις</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">Ημερομηνίες Επικοινωνίας</label>
                <Button
                  type="button"
                  onClick={addCommunicationDate}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
                >
                  Προσθήκη Ημερομηνίας
                </Button>
              </div>
              
              <div className="space-y-2">
                {formData.communicationDates?.map((date, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2">
                    <span className="text-gray-300">{new Date(date).toLocaleDateString('el-GR')}</span>
                    <Button
                      type="button"
                      onClick={() => removeCommunicationDate(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      Αφαίρεση
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-600">
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="border-slate-600 text-gray-300 hover:bg-slate-700/50 hover:text-white"
              >
                Ακύρωση
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-white hover:opacity-90"
              >
                {citizen ? 'Ενημέρωση' : 'Αποθήκευση'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenForm;