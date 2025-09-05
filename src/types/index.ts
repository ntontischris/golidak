export interface Citizen {
  id: string
  surname: string
  name: string
  recommendation_from?: string
  patronymic?: string
  mobile_phone?: string
  landline_phone?: string
  email?: string
  address?: string
  postal_code?: string
  municipality?: Municipality
  area?: string
  electoral_district?: ElectoralDistrict
  last_contact_date?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface MilitaryPersonnel {
  id: string
  name: string
  surname: string
  rank?: string
  service_unit?: string
  wish?: string
  send_date?: string
  comments?: string
  military_id?: string
  esso?: string
  esso_year?: string
  esso_letter?: EssoLetter
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Request {
  id: string
  citizen_id?: string
  military_personnel_id?: string
  request_type: string
  description: string
  status: RequestStatus
  send_date?: string
  completion_date?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface Reminder {
  id: string
  title: string
  description?: string
  reminder_date: string
  reminder_type: ReminderType
  related_request_id?: string
  is_completed: boolean
  created_at: string
  created_by?: string
}

export interface UserProfile {
  id: string
  full_name?: string
  role: UserRole
  last_login_at?: string
  last_login_ip?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Municipality = 
  | 'ΠΑΥΛΟΥ ΜΕΛΑ' 
  | 'ΚΟΡΔΕΛΙΟΥ-ΕΥΟΣΜΟΥ' 
  | 'ΑΜΠΕΛΟΚΗΠΩΝ-ΜΕΝΕΜΕΝΗΣ' 
  | 'ΝΕΑΠΟΛΗΣ-ΣΥΚΕΩΝ' 
  | 'ΘΕΣΣΑΛΟΝΙΚΗΣ' 
  | 'ΚΑΛΑΜΑΡΙΑΣ' 
  | 'ΑΛΛΟ'

export type ElectoralDistrict = 'Α ΘΕΣΣΑΛΟΝΙΚΗΣ' | 'Β ΘΕΣΣΑΛΟΝΙΚΗΣ'

export type EssoLetter = 'Α' | 'Β' | 'Γ' | 'Δ' | 'Ε' | 'ΣΤ'

export type RequestStatus = 'ΕΚΚΡΕΜΕΙ' | 'ΟΛΟΚΛΗΡΩΘΗΚΕ' | 'ΑΠΟΡΡΙΦΘΗΚΕ'

export type ReminderType = 'ΕΟΡΤΗ' | 'ΑΙΤΗΜΑ' | 'ΓΕΝΙΚΗ'

export type UserRole = 'USER' | 'ADMIN'

export interface SearchFilters {
  name?: string
  surname?: string
  phone?: string
  email?: string
  municipality?: Municipality
  electoral_district?: ElectoralDistrict
  recommendation_from?: string
}

export interface MilitarySearchFilters {
  name?: string
  surname?: string
  rank?: string
  esso?: string
  esso_year?: string
  esso_letter?: EssoLetter
}