import Dexie, { Table } from 'dexie';
import { Citizen, Request, Contact, MilitaryPersonnel, User } from '../types';

export class CitizenManagementDB extends Dexie {
  citizens!: Table<Citizen>;
  requests!: Table<Request>;
  contacts!: Table<Contact>;
  militaryPersonnel!: Table<MilitaryPersonnel>;
  users!: Table<User>;

  constructor() {
    super('CitizenManagementDB');
    this.version(1).stores({
      citizens: 'id, name, surname, region, property, dateAdded, responsibleEmployee, nameDay, lastCommunication',
      requests: 'id, citizenId, category, status, dateSubmitted, dateCompleted, dateSent',
      contacts: 'id, citizenId, category, date',
      militaryPersonnel: 'id, citizenId, name, surname, rank, serviceUnit, esso, isPermanent',
      users: 'id, username, name, role, createdAt'
    });
  }
}

export const db = new CitizenManagementDB();

export const initializeDatabase = async () => {
  try {
    await db.open();
    
    const userCount = await db.users.count();
    if (userCount === 0) {
      await db.users.add({
        id: 'admin-1',
        username: 'admin',
        name: 'Administrator',
        role: 'ADMIN',
        createdAt: new Date().toISOString()
      });
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
};

export interface SearchFilters {
  region?: string;
  contactCategory?: string;
  property?: string;
  dateAddedFrom?: string;
  dateAddedTo?: string;
  responsibleEmployee?: string;
  requestCategory?: string;
  requestStatus?: string;
  dateCompletedFrom?: string;
  dateCompletedTo?: string;
  esso?: string;
}

export const searchCitizens = async (searchTerm: string = '', filters: SearchFilters = {}) => {
  let query = db.citizens.toCollection();
  
  // Apply basic search term
  if (searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    query = query.filter(citizen => 
      citizen.name.toLowerCase().includes(term) ||
      citizen.surname.toLowerCase().includes(term) ||
      (citizen.idNumber?.toLowerCase().includes(term) ?? false) ||
      (citizen.afm?.toLowerCase().includes(term) ?? false) ||
      (citizen.phone?.includes(term) ?? false) ||
      (citizen.email?.toLowerCase().includes(term) ?? false)
    );
  }
  
  // Apply filters
  if (filters.region) {
    query = query.filter(citizen => citizen.region === filters.region);
  }
  
  if (filters.property) {
    query = query.filter(citizen => 
      citizen.property.toLowerCase().includes(filters.property!.toLowerCase())
    );
  }
  
  if (filters.responsibleEmployee) {
    query = query.filter(citizen => 
      citizen.responsibleEmployee.toLowerCase().includes(filters.responsibleEmployee!.toLowerCase())
    );
  }
  
  if (filters.dateAddedFrom) {
    query = query.filter(citizen => 
      new Date(citizen.dateAdded) >= new Date(filters.dateAddedFrom!)
    );
  }
  
  if (filters.dateAddedTo) {
    query = query.filter(citizen => 
      new Date(citizen.dateAdded) <= new Date(filters.dateAddedTo!)
    );
  }
  
  return await query.toArray();
};

export const getPendingRequests = async () => {
  const twentyFiveDaysAgo = new Date();
  twentyFiveDaysAgo.setDate(twentyFiveDaysAgo.getDate() - 25);
  
  return await db.requests
    .where('status')
    .equals('ΕΚΚΡΕΜΕΙ')
    .and(request => new Date(request.dateSubmitted) <= twentyFiveDaysAgo)
    .toArray();
};

export const getStatistics = async () => {
  const totalCitizens = await db.citizens.count();
  const totalRequests = await db.requests.count();
  const completedRequests = await db.requests.where('status').equals('ΟΛΟΚΛΗΡΩΜΕΝΟ').count();
  const pendingRequests = await db.requests.where('status').equals('ΕΚΚΡΕΜΕΙ').count();
  
  const requestsByCategory = await db.requests.orderBy('category').uniqueKeys();
  const citizensByRegion = await db.citizens.orderBy('region').uniqueKeys();
  
  return {
    totalCitizens,
    totalRequests,
    completedRequests,
    pendingRequests,
    requestsByCategory: requestsByCategory.length,
    citizensByRegion: citizensByRegion.length
  };
};