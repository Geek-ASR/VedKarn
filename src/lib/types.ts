
export type UserRole = 'mentor' | 'mentee' | null;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  profileImageUrl?: string;
  bio?: string;
  interests?: string[];
}

export interface ExperienceItem {
  id: string;
  institutionName: string; // University or Company name
  roleOrDegree: string; // Job title or Degree
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string, optional for current roles/studies
  description?: string;
}

export interface MentorProfile extends User {
  role: 'mentor';
  expertise?: string[]; // Specific areas of expertise
  universities: ExperienceItem[];
  companies: ExperienceItem[];
  availabilitySlots?: AvailabilitySlot[];
  hourlyRate?: number;
  yearsOfExperience?: number;
}

export interface MenteeProfile extends User {
  role: 'mentee';
  learningGoals?: string;
  desiredUniversities?: string[];
  desiredJobRoles?: string[];
  desiredCompanies?: string[];
}

export type UserProfile = MentorProfile | MenteeProfile | User;


export interface AvailabilitySlot {
  id: string;
  startTime: string; // ISO DateTime string
  endTime: string; // ISO DateTime string
  isBooked: boolean;
  bookedByMenteeId?: string;
  meetingLink?: string;
}

export interface Booking {
  id: string;
  mentorId: string;
  menteeId: string;
  slotId: string;
  startTime: string; // ISO DateTime string
  endTime: string; // ISO DateTime string
  status: 'confirmed' | 'pending' | 'cancelled';
  meetingLink?: string; // Added for mock meet link
  meetingNotes?: string;
}

export interface MentorSearchFilters {
  university?: string;
  jobRole?: string;
  company?: string;
  query?: string;
}

export interface GroupSession {
  id: string;
  title: string;
  description: string;
  hostName: string;
  date: string; // Simple string for now, e.g., "October 26th, 2024 at 2:00 PM"
  tags: string[];
  imageUrl?: string; // Placeholder URL
  participantCount?: number;
  maxParticipants?: number;
  price?: string; // e.g., "Free", "$20"
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  speakerName: string;
  date: string; // Simple string for now
  topic: string;
  imageUrl?: string; // Placeholder URL
  duration?: string; // e.g., "60 minutes"
}
