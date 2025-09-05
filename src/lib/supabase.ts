import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      citizens: {
        Row: {
          id: string
          surname: string
          name: string
          recommendation_from: string | null
          patronymic: string | null
          mobile_phone: string | null
          landline_phone: string | null
          email: string | null
          address: string | null
          postal_code: string | null
          municipality: string | null
          area: string | null
          electoral_district: string | null
          last_contact_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          surname: string
          name: string
          recommendation_from?: string | null
          patronymic?: string | null
          mobile_phone?: string | null
          landline_phone?: string | null
          email?: string | null
          address?: string | null
          postal_code?: string | null
          municipality?: string | null
          area?: string | null
          electoral_district?: string | null
          last_contact_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          surname?: string
          name?: string
          recommendation_from?: string | null
          patronymic?: string | null
          mobile_phone?: string | null
          landline_phone?: string | null
          email?: string | null
          address?: string | null
          postal_code?: string | null
          municipality?: string | null
          area?: string | null
          electoral_district?: string | null
          last_contact_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      military_personnel: {
        Row: {
          id: string
          name: string
          surname: string
          rank: string | null
          service_unit: string | null
          wish: string | null
          send_date: string | null
          comments: string | null
          military_id: string | null
          esso: string | null
          esso_year: string | null
          esso_letter: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          surname: string
          rank?: string | null
          service_unit?: string | null
          wish?: string | null
          send_date?: string | null
          comments?: string | null
          military_id?: string | null
          esso?: string | null
          esso_year?: string | null
          esso_letter?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          surname?: string
          rank?: string | null
          service_unit?: string | null
          wish?: string | null
          send_date?: string | null
          comments?: string | null
          military_id?: string | null
          esso?: string | null
          esso_year?: string | null
          esso_letter?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      requests: {
        Row: {
          id: string
          citizen_id: string | null
          military_personnel_id: string | null
          request_type: string
          description: string
          status: string
          send_date: string | null
          completion_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          citizen_id?: string | null
          military_personnel_id?: string | null
          request_type: string
          description: string
          status?: string
          send_date?: string | null
          completion_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          citizen_id?: string | null
          military_personnel_id?: string | null
          request_type?: string
          description?: string
          status?: string
          send_date?: string | null
          completion_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
    }
  }
}