import React, { useState, useEffect } from 'react';
import { Request, RequestCategory, RequestStatus } from '../types';
import { db } from '../database/db';

interface RequestFormProps {
  citizenId: string;
  request?: Request;
  onSave: (request: Request) => void;
  onCancel: () => void;
}

const RequestForm: React.FC<RequestFormProps> = ({ citizenId, request, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Request>>({
    category: 'ΔΙΟΙΚΗΤΙΚΟ',
    status: 'ΕΚΚΡΕΜΕΙ',
    description: '',
    notes: ''
  });

  useEffect(() => {
    if (request) {
      setFormData(request);
    }
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requestData: Request = {
      id: request?.id || `request-${Date.now()}`,
      citizenId,
      category: formData.category as RequestCategory,
      status: formData.status as RequestStatus,
      description: formData.description!,
      dateSubmitted: request?.dateSubmitted || new Date().toISOString(),
      dateCompleted: formData.status === 'ΟΛΟΚΛΗΡΩΜΕΝΟ' ? (formData.dateCompleted || new Date().toISOString()) : undefined,
      dateSent: formData.dateSent,
      notes: formData.notes
    };

    try {
      if (request) {
        await db.requests.update(request.id, requestData);
      } else {
        await db.requests.add(requestData);
      }
      onSave(requestData);
    } catch (error) {
      console.error('Error saving request:', error);
    }
  };

  return (
    <div className="request-form-overlay">
      <div className="request-form">
        <h2>{request ? 'Επεξεργασία Αιτήματος' : 'Νέο Αίτημα'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Κατηγορία Αιτήματος *</label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as RequestCategory }))}
              required
            >
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

          <div className="form-group">
            <label>Κατάσταση *</label>
            <select
              value={formData.status || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as RequestStatus }))}
              required
            >
              <option value="ΕΚΚΡΕΜΕΙ">ΕΚΚΡΕΜΕΙ</option>
              <option value="ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ">ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ</option>
              <option value="ΟΛΟΚΛΗΡΩΜΕΝΟ">ΟΛΟΚΛΗΡΩΜΕΝΟ</option>
            </select>
          </div>

          <div className="form-group">
            <label>Περιγραφή Αιτήματος *</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label>Ημερομηνία Αποστολής</label>
            <input
              type="date"
              value={formData.dateSent ? formData.dateSent.split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({ ...prev, dateSent: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
            />
          </div>

          {formData.status === 'ΟΛΟΚΛΗΡΩΜΕΝΟ' && (
            <div className="form-group">
              <label>Ημερομηνία Ολοκλήρωσης</label>
              <input
                type="date"
                value={formData.dateCompleted ? formData.dateCompleted.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, dateCompleted: e.target.value ? new Date(e.target.value).toISOString() : undefined }))}
              />
            </div>
          )}

          <div className="form-group">
            <label>Παρατηρήσεις</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Ακύρωση
            </button>
            <button type="submit" className="save-btn">
              {request ? 'Ενημέρωση' : 'Αποθήκευση'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestForm;