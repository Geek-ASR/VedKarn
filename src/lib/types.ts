
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

export type MentorshipFocusType = 'career' | 'university';
export type DegreeLevelType = 'Bachelors' | 'Masters' | 'PhD';

export interface MentorProfile extends User {
  role: 'mentor';
  expertise?: string[]; // Specific areas of expertise for career
  universities: ExperienceItem[];
  companies: ExperienceItem[];
  availabilitySlots?: AvailabilitySlot[];
  hourlyRate?: number; // Example, not currently used in forms
  yearsOfExperience?: number;

  // New fields for mentorship focus
  mentorshipFocus?: MentorshipFocusType[]; // Can be one or both
  // Fields specific to university mentorship
  targetDegreeLevels?: DegreeLevelType[]; // e.g., ["Masters", "PhD"]
  guidedUniversities?: string[]; // Universities they have experience guiding for
  applicationExpertise?: string[]; // e.g., ["Essay Review", "SOP Crafting", "LOR Advice"]
}

export interface MenteeProfile extends User {
  role: 'mentee';
  learningGoals?: string; // General learning goals
  desiredJobRoles?: string[]; // For career focus
  desiredCompanies?: string[]; // For career focus

  // New fields for mentorship seeking focus
  seekingMentorshipFor?: MentorshipFocusType[]; // What the mentee is looking for
  // Fields specific to university seeking mentees
  currentEducationLevel?: string; // e.g., "High School Senior", "Undergraduate Junior"
  targetDegreeLevel?: DegreeLevelType;
  targetFieldsOfStudy?: string[];
  desiredUniversities?: string[]; // Already exists, very relevant here
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
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: string; // ISO DateTime string
  endTime: string; // ISO DateTime string
  status: 'confirmed' | 'pending' | 'cancelled';
  meetingNotes?: string;
}

export interface EnrichedBooking extends Booking {
  mentor: UserProfile; // Should ideally be MentorProfile
  mentee: UserProfile; // Should ideally be MenteeProfile
  sessionTitle: string;
}


export interface MentorSearchFilters {
  university?: string;
  jobRole?: string;
  company?: string;
  query?: string;
  mentorshipFocus?: MentorshipFocusType; // New filter
}

export interface GroupSession {
  id:string;
  title: string;
  description: string;
  hostId: string;
  hostName: string;
  hostProfileImageUrl?: string;
  date: string;
  tags: string[];
  imageUrl?: string;
  participantCount?: number;
  maxParticipants?: number;
  price?: string;
  duration?: string;
  // focus?: 'career' | 'university' | 'general'; // Future consideration
}

export interface Webinar {
  id: string;
  title: string;
  description: string;
  hostId: string;
  speakerName: string;
  hostProfileImageUrl?: string;
  date: string;
  topic: string;
  imageUrl?: string;
  duration?: string;
  // focus?: 'career' | 'university' | 'general'; // Future consideration
}
