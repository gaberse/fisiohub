export type UserRole = 'receptionist' | 'therapist' | 'admin' | 'patient'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  clinic_id: string
  created_at: string
}

export interface Clinic {
  id: string
  name: string
  logo_url?: string
  primary_color?: string
  created_at: string
}

export interface Branch {
  id: string
  clinic_id: string
  name: string
  address?: string
  phone?: string
  active: boolean
  created_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  email?: string
  phone?: string
  birth_date?: string
  created_at: string
  intake_completed: boolean
  user_id?: string
}

export interface PatientIntake {
  id: string
  patient_id: string
  reason: string
  medical_history?: string
  current_medications?: string
  pain_areas: string[]
  pain_level: number
  goals?: string
  completed_at: string
}

export interface Therapist {
  id: string
  profile_id: string
  clinic_id: string
  full_name: string
  specialty?: string
}

export interface Package {
  id: string
  clinic_id: string
  name: string
  description?: string
  session_count: number
  price: number
  validity_days: number
  active: boolean
}

export interface PatientPackage {
  id: string
  patient_id: string
  package_id: string
  clinic_id: string
  sessions_total: number
  sessions_used: number
  purchased_at: string
  expires_at: string
  sold_by?: string
  package?: Package
  patient?: Patient
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  therapist_id: string
  patient_package_id?: string
  scheduled_at: string
  duration_minutes: number
  status: AppointmentStatus
  notes?: string
  created_by: string
  patient?: Patient
  therapist?: Therapist
  session_note?: SessionNote
  satisfaction?: SatisfactionSurvey
}

export interface SessionNote {
  id: string
  appointment_id: string
  therapist_id: string
  treatments: string[]
  areas_treated: string[]
  observations?: string
  next_session_recommendation?: string
  created_at: string
}

export interface SatisfactionSurvey {
  id: string
  appointment_id: string
  patient_id: string
  therapist_id: string
  rating: number
  comments?: string
  completed_at: string
}
