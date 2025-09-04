import React, { useState, useEffect } from 'react';
import { MilitaryPersonnel, MilitaryRank } from '../types';
import { db } from '../database/db';

interface MilitaryFormProps {
  citizenId: string;
  militaryPersonnel?: MilitaryPersonnel;
  onSave: (military: MilitaryPersonnel) => void;
  onCancel: () => void;
}

const MilitaryForm: React.FC<MilitaryFormProps> = ({ citizenId, militaryPersonnel, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<MilitaryPersonnel>>({
    name: '',
    surname: '',
    rank: 'ΣΤΡΑΤΙΩΤΗΣ',
    serviceUnit: '',
    isPermanent: false
  });
  
  const [essoYear, setEssoYear] = useState<string>(new Date().getFullYear().toString());
  const [essoLetter, setEssoLetter] = useState<string>('Α');

  useEffect(() => {
    if (militaryPersonnel) {
      setFormData(militaryPersonnel);
      if (militaryPersonnel.esso) {
        const match = militaryPersonnel.esso.match(/(\d{4})([ΑΒΓΔΕΣΤ])/);
        if (match) {
          setEssoYear(match[1]);
          setEssoLetter(match[2]);
        }
      }
    }
  }, [militaryPersonnel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const militaryData: MilitaryPersonnel = {
      id: militaryPersonnel?.id || `military-${Date.now()}`,
      citizenId,
      name: formData.name!,
      surname: formData.surname!,
      rank: formData.rank as MilitaryRank,
      serviceUnit: formData.serviceUnit!,
      desire: formData.desire,
      dateSent: formData.dateSent,
      comments: formData.comments,
      am: formData.am,
      dateTransfer: formData.dateTransfer,
      esso: `${essoYear}${essoLetter}`,
      isPermanent: formData.isPermanent || false
    };

    try {
      if (militaryPersonnel) {
        await db.militaryPersonnel.update(militaryPersonnel.id, militaryData);
      } else {
        await db.militaryPersonnel.add(militaryData);
      }
      onSave(militaryData);
    } catch (error) {
      console.error('Error saving military personnel:', error);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const letters = ['Α', 'Β', 'Γ', 'Δ', 'Ε', 'ΣΤ'];

  return (
    <div className="military-form-overlay">
      <div className="military-form">
        <h2>{militaryPersonnel ? 'Επεξεργασία Στρατιωτικού Προσωπικού' : 'Νέο Στρατιωτικό Προσωπικό'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isPermanent || false}
                onChange={(e) => setFormData(prev => ({ ...prev, isPermanent: e.target.checked }))}
              />
              Μόνιμος
            </label>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Όνομα *</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Επώνυμο *</label>
              <input
                type="text"
                value={formData.surname || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Βαθμός *</label>
              <select
                value={formData.rank || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value as MilitaryRank }))}
                required
              >
                <option value="ΣΤΡΑΤΙΩΤΗΣ">ΣΤΡΑΤΙΩΤΗΣ</option>
                <option value="ΔΕΚΑΝΕΑΣ">ΔΕΚΑΝΕΑΣ</option>
                <option value="ΛΟΧΙΑΣ">ΛΟΧΙΑΣ</option>
                <option value="ΕΠΙΛΟΧΙΑΣ">ΕΠΙΛΟΧΙΑΣ</option>
                <option value="ΑΝΘΥΠΑΣΠΙΣΤΗΣ">ΑΝΘΥΠΑΣΠΙΣΤΗΣ</option>
                <option value="ΥΠΑΣΠΙΣΤΗΣ">ΥΠΑΣΠΙΣΤΗΣ</option>
                <option value="ΑΡΧΙΛΟΧΙΑΣ">ΑΡΧΙΛΟΧΙΑΣ</option>
                <option value="ΑΝΘΥΠΟΛΟΧΑΓΟΣ">ΑΝΘΥΠΟΛΟΧΑΓΟΣ</option>
                <option value="ΥΠΟΛΟΧΑΓΟΣ">ΥΠΟΛΟΧΑΓΟΣ</option>
                <option value="ΛΟΧΑΓΟΣ">ΛΟΧΑΓΟΣ</option>
                <option value="ΤΑΓΜΑΤΑΡΧΗΣ">ΤΑΓΜΑΤΑΡΧΗΣ</option>
                <option value="ΑΝΤΙΣΥΝΤΑΓΜΑΤΑΡΧΗΣ">ΑΝΤΙΣΥΝΤΑΓΜΑΤΑΡΧΗΣ</option>
                <option value="ΣΥΝΤΑΓΜΑΤΑΡΧΗΣ">ΣΥΝΤΑΓΜΑΤΑΡΧΗΣ</option>
                <option value="ΤΑΞΙΑΡΧΟΣ">ΤΑΞΙΑΡΧΟΣ</option>
                <option value="ΥΠΟΣΤΡΑΤΗΓΟΣ">ΥΠΟΣΤΡΑΤΗΓΟΣ</option>
                <option value="ΑΝΤΙΣΤΡΑΤΗΓΟΣ">ΑΝΤΙΣΤΡΑΤΗΓΟΣ</option>
                <option value="ΣΤΡΑΤΗΓΟΣ">ΣΤΡΑΤΗΓΟΣ</option>
              </select>
            </div>

            <div className="form-group">
              <label>Μονάδα Υπηρεσίας *</label>
              <input
                type="text"
                value={formData.serviceUnit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceUnit: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Επιθυμία</label>
              <input
                type="text"
                value={formData.desire || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, desire: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>ΑΜ</label>
              <input
                type="text"
                value={formData.am || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, am: e.target.value }))}
              />
            </div>
          </div>

          <div className="esso-section">
            <h3>ΕΣΣΟ</h3>
            <div className="esso-controls">
              <div className="form-group">
                <label>Έτος</label>
                <select
                  value={essoYear}
                  onChange={(e) => setEssoYear(e.target.value)}
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Γράμμα</label>
                <select
                  value={essoLetter}
                  onChange={(e) => setEssoLetter(e.target.value)}
                >
                  {letters.map(letter => (
                    <option key={letter} value={letter}>{letter}</option>
                  ))}
                </select>
              </div>

              <div className="esso-display">
                <strong>ΕΣΣΟ: {essoYear}{essoLetter}</strong>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Ημερομηνία Αποστολής</label>
            <input
              type="date"
              value={formData.dateSent ? formData.dateSent.split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dateSent: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
            />
          </div>

          {formData.isPermanent && (
            <div className="form-group">
              <label>Ημερομηνία Μετάθεσης/Απόσπασης</label>
              <input
                type="date"
                value={formData.dateTransfer ? formData.dateTransfer.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dateTransfer: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>Σχόλια/Παρατηρήσεις</label>
            <textarea
              value={formData.comments || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Ακύρωση
            </button>
            <button type="submit" className="save-btn">
              {militaryPersonnel ? 'Ενημέρωση' : 'Αποθήκευση'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilitaryForm;