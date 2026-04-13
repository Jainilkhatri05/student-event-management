// types/index.ts — Shared TypeScript interfaces
export interface Event {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  organizer_id: number | null;
  created_at: string;
  organizer_name?: string;
  registration_count?: number;
}

export interface Student {
  student_id: number;
  name: string;
  email: string;
  department: string;
  created_at: string;
}

export interface Registration {
  registration_id: number;
  student_id: number;
  event_id: number;
  registered_at: string;
  student_name?: string;
  event_title?: string;
}
