export type ContactCategory = 'GDPR' | 'ΑΙΤΗΜΑ' | 'GDPR ΚΑΙ ΑΙΤΗΜΑ';

export type RequestCategory = 
  | 'ΣΤΡΑΤΙΩΤΙΚΟ'
  | 'ΙΑΤΡΙΚΟ'
  | 'ΑΣΤΥΝΟΜΙΚΟ'
  | 'ΠΥΡΟΣΒΕΣΤΙΚΗ'
  | 'ΠΑΙΔΕΙΑΣ'
  | 'ΔΙΟΙΚΗΤΙΚΟ'
  | 'ΕΥΡΕΣΗ ΕΡΓΑΣΙΑΣ'
  | 'ΕΦΚΑ'
  | 'ΑΛΛΟ';

export type RequestStatus = 'ΟΛΟΚΛΗΡΩΜΕΝΟ' | 'ΜΗ ΟΛΟΚΛΗΡΩΜΕΝΟ' | 'ΕΚΚΡΕΜΕΙ';

export type Region = 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ' | 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ' | 'ΑΛΛΟ';

export type MilitaryRank = 
  | 'ΣΤΡΑΤΙΩΤΗΣ'
  | 'ΔΕΚΑΝΕΑΣ'
  | 'ΛΟΧΙΑΣ'
  | 'ΕΠΙΛΟΧΙΑΣ'
  | 'ΑΝΘΥΠΑΣΠΙΣΤΗΣ'
  | 'ΥΠΑΣΠΙΣΤΗΣ'
  | 'ΑΡΧΙΛΟΧΙΑΣ'
  | 'ΑΝΘΥΠΟΛΟΧΑΓΟΣ'
  | 'ΥΠΟΛΟΧΑΓΟΣ'
  | 'ΛΟΧΑΓΟΣ'
  | 'ΤΑΓΜΑΤΑΡΧΗΣ'
  | 'ΑΝΤΙΣΥΝΤΑΓΜΑΤΑΡΧΗΣ'
  | 'ΣΥΝΤΑΓΜΑΤΑΡΧΗΣ'
  | 'ΤΑΞΙΑΡΧΟΣ'
  | 'ΥΠΟΣΤΡΑΤΗΓΟΣ'
  | 'ΑΝΤΙΣΤΡΑΤΗΓΟΣ'
  | 'ΣΤΡΑΤΗΓΟΣ';

export interface Citizen {
  id: string;
  name: string;
  surname: string;
  fatherName?: string;
  motherName?: string;
  birthDate?: string;
  idNumber?: string;
  afm?: string;
  phone?: string;
  email?: string;
  address?: string;
  region: Region;
  property: string;
  dateAdded: string;
  responsibleEmployee: string;
  nameDay?: string;
  notes?: string;
  lastCommunication?: string;
  communicationDates: string[];
}

export interface Request {
  id: string;
  citizenId: string;
  category: RequestCategory;
  status: RequestStatus;
  description: string;
  dateSubmitted: string;
  dateCompleted?: string;
  dateSent?: string;
  notes?: string;
}

export interface Contact {
  id: string;
  citizenId: string;
  category: ContactCategory;
  date: string;
  notes?: string;
}

export interface MilitaryPersonnel {
  id: string;
  citizenId: string;
  name: string;
  surname: string;
  rank: MilitaryRank;
  serviceUnit: string;
  desire?: string;
  dateSent?: string;
  comments?: string;
  am?: string;
  dateTransfer?: string;
  esso?: string;
  isPermanent: boolean;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'USER';
  createdAt: string;
}