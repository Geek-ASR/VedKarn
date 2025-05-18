
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
}

export interface Booking {
  id: string; // Can be slotId for uniqueness in mock
  mentorId: string;
  menteeId: string;
  startTime: string; // ISO DateTime string
  endTime: string; // ISO DateTime string
  status: 'confirmed' | 'pending' | 'cancelled'; // status might be derived or fixed for mock
  meetingNotes?: string;
  // Removed meetingLink, as per previous requests for in-app call simulation
}

// New type for the schedule page
export interface EnrichedBooking extends Booking {
  mentor: UserProfile; 
  mentee: UserProfile;
  sessionTitle: string; // e.g., "Session with Mentor Name" or "Session with Mentee Name"
}


export interface MentorSearchFilters {
  university?: string;
  jobRole?: string;
  company?: string;
  query?: string;
}

export interface GroupSession {
  id:string;
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

    