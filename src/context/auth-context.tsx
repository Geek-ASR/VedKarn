
"use client";

import type { UserProfile, UserRole, MentorProfile, MenteeProfile, EnrichedBooking, AvailabilitySlot, Booking, ExperienceItem, GroupSession, Webinar, MentorshipFocusType, DegreeLevelType } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Define MOCK_USERS first with static dates
export const MOCK_USERS: Record<string, UserProfile> = {
  'mentor@example.com': {
    id: 'mentor1',
    email: 'mentor@example.com',
    name: 'Dr. Eleanor Vance',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Experienced AI researcher with a passion for guiding students. Specializing in Machine Learning and Natural Language Processing for both career and academic pursuits.',
    interests: ['AI Ethics', 'Deep Learning', 'Academic Research'],
    expertise: ['Machine Learning', 'NLP', 'Computer Vision', 'PhD Applications'],
    universities: [
      { id: 'uni1-mv', institutionName: 'Stanford University', roleOrDegree: 'PhD in AI', startDate: '2010-09-01', endDate: '2014-06-01', description: 'Focused on novel neural network architectures.' },
      { id: 'uni2-mv', institutionName: 'MIT', roleOrDegree: 'M.S. Computer Science', startDate: '2008-09-01', endDate: '2010-06-01' },
    ],
    companies: [
      { id: 'comp1-mv', institutionName: 'Google AI', roleOrDegree: 'Senior Research Scientist', startDate: '2016-07-01', description: 'Led projects in large language model development.' },
      { id: 'comp2-mv', institutionName: 'OpenAI', roleOrDegree: 'Research Engineer', startDate: '2014-07-01', endDate: '2016-06-30' },
    ],
    yearsOfExperience: 10,
    availabilitySlots: [ 
      { id: 'slot1', startTime: '2024-10-27T10:00:00.000Z', endTime: '2024-10-27T11:00:00.000Z', isBooked: false},
      { id: 'slot2', startTime: '2024-10-28T14:00:00.000Z', endTime: '2024-10-28T15:00:00.000Z', isBooked: false },
      { id: 'slot3', startTime: '2024-10-29T16:00:00.000Z', endTime: '2024-10-29T17:00:00.000Z', isBooked: true, bookedByMenteeId: 'mentee1' }, 
      { id: 'slot-past-booked', startTime: '2024-10-25T09:00:00.000Z', endTime: '2024-10-25T10:00:00.000Z', isBooked: true, bookedByMenteeId: 'mentee1' },
    ],
    mentorshipFocus: ['career', 'university'],
    targetDegreeLevels: ['Masters', 'PhD'],
    guidedUniversities: ['Stanford University', 'MIT', 'UC Berkeley'],
    applicationExpertise: ['SOP Crafting', 'Research Proposals', 'PhD Interview Prep'],
  } as MentorProfile,
  'mentee@example.com': {
    id: 'mentee1',
    email: 'mentee@example.com',
    name: 'Alex Chen',
    role: 'mentee',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Undergraduate student eager to learn about data science and pursue higher education in computer science.',
    interests: ['Data Visualization', 'Python Programming', 'Photography'],
    learningGoals: 'Get into a top M.S. program for Data Science and learn about real-world applications of ML.',
    desiredUniversities: ['Stanford University', 'Carnegie Mellon University'],
    desiredJobRoles: ['Data Scientist', 'Machine Learning Engineer'],
    desiredCompanies: ['Google', 'Meta', 'Netflix'],
    seekingMentorshipFor: ['university', 'career'],
    currentEducationLevel: 'Undergraduate Senior',
    targetDegreeLevel: 'Masters',
    targetFieldsOfStudy: ['Data Science', 'Computer Science'],
  } as MenteeProfile,
   'mentor2@example.com': {
    id: 'mentor2',
    email: 'mentor2@example.com',
    name: 'Dr. Ben Carter',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Product Management expert with 12+ years in tech. Passionate about building great products and mentoring future leaders for career growth.',
    interests: ['Product Strategy', 'User Experience', 'Startups'],
    expertise: ['Product Management', 'Agile Development', 'Market Analysis', 'UX Strategy', 'Career Transitions'],
    universities: [{ id: 'uni1-bc', institutionName: 'UC Berkeley', roleOrDegree: 'MBA', startDate: '2006-08-01', endDate: '2008-05-01', description: 'Emphasis on Technology Management.' }],
    companies: [
        { id: 'comp1-bc', institutionName: 'Salesforce', roleOrDegree: 'Director of Product', startDate: '2015-03-01', description: 'Led product strategy for key cloud services.' },
        { id: 'comp2-bc', institutionName: 'Adobe', roleOrDegree: 'Senior Product Manager', startDate: '2010-06-01', endDate: '2015-02-28', description: 'Managed flagship creative software products.' }
    ],
    yearsOfExperience: 12,
    availabilitySlots: [ 
      { id: 'slot4', startTime: '2024-10-27T12:00:00.000Z', endTime: '2024-10-27T14:00:00.000Z', isBooked: false },
      { id: 'slot5', startTime: '2024-10-28T17:00:00.000Z', endTime: '2024-10-28T19:00:00.000Z', isBooked: false },
    ],
    mentorshipFocus: ['career'],
  } as MentorProfile,
  'mentor3@example.com': {
    id: 'mentor3',
    email: 'mentor3@example.com',
    name: 'Jane Doe',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Marketing strategist with a knack for branding and digital campaigns. Helps mentees navigate the marketing world and build impactful careers.',
    interests: ['Digital Marketing', 'Brand Strategy', 'Content Creation'],
    expertise: ['SEO/SEM', 'Social Media Marketing', 'Brand Development', 'Market Research'],
    universities: [{ id: 'uni1-jd', institutionName: 'New York University', roleOrDegree: 'M.S. Marketing', startDate: '2012-09-01', endDate: '2014-06-01' }],
    companies: [
      { id: 'comp1-jd', institutionName: 'XYZ Corp', roleOrDegree: 'Marketing Director', startDate: '2018-01-01', description: 'Led global marketing initiatives.' },
      { id: 'comp2-jd', institutionName: 'Startup Inc.', roleOrDegree: 'Head of Marketing', startDate: '2015-05-01', endDate: '2017-12-31', description: 'Built marketing from the ground up.' },
    ],
    yearsOfExperience: 8,
    availabilitySlots: [
      { id: 'slot-jd1', startTime: '2024-11-01T09:00:00.000Z', endTime: '2024-11-01T10:00:00.000Z', isBooked: false },
      { id: 'slot-jd2', startTime: '2024-11-02T11:00:00.000Z', endTime: '2024-11-02T12:00:00.000Z', isBooked: false },
    ],
    mentorshipFocus: ['career'],
  } as MentorProfile,
  'mentor4@example.com': {
    id: 'mentor4',
    email: 'mentor4@example.com',
    name: 'Dr. Raj Patel',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Dedicated to helping students get into top engineering PhD programs. Research focused on renewable energy systems.',
    interests: ['Sustainable Tech', 'Academic Publishing', 'Grant Writing'],
    expertise: ['PhD Admissions (Engineering)', 'Research Methodology', 'Thesis Writing', 'Renewable Energy'],
    universities: [
      { id: 'uni1-rp', institutionName: 'Georgia Tech', roleOrDegree: 'PhD in Mechanical Engineering', startDate: '2008-08-01', endDate: '2012-05-01' },
      { id: 'uni2-rp', institutionName: 'University of Michigan', roleOrDegree: 'Postdoctoral Fellow', startDate: '2012-06-01', endDate: '2014-05-31' },
    ],
    companies: [
      { id: 'comp1-rp', institutionName: 'National Renewable Energy Lab', roleOrDegree: 'Senior Researcher', startDate: '2014-06-01', description: 'Published extensively on solar thermal systems.' },
    ],
    yearsOfExperience: 10,
    availabilitySlots: [
      { id: 'slot-rp1', startTime: '2024-11-03T13:00:00.000Z', endTime: '2024-11-03T14:00:00.000Z', isBooked: false },
    ],
    mentorshipFocus: ['university'],
    targetDegreeLevels: ['PhD'],
    guidedUniversities: ['Georgia Tech', 'MIT', 'Stanford University'],
    applicationExpertise: ['Research Statement Review', 'Contacting Professors', 'PhD Fellowship Apps'],
  } as MentorProfile,
  'mentor5@example.com': {
    id: 'mentor5',
    email: 'mentor5@example.com',
    name: 'Sarah Lee',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'UX Designer and creative director. Passionate about helping individuals break into design and build strong portfolios, whether for university or industry.',
    interests: ['Interaction Design', 'User Research', 'Visual Storytelling', 'Portfolio Building'],
    expertise: ['UX/UI Design', 'Portfolio Review', 'Design Thinking', 'Frontend Development Basics', 'Masters Applications (Design)'],
    universities: [
      { id: 'uni1-sl', institutionName: 'Rhode Island School of Design', roleOrDegree: 'MFA Graphic Design', startDate: '2013-09-01', endDate: '2015-05-01' },
    ],
    companies: [
      { id: 'comp1-sl', institutionName: 'DesignHub Agency', roleOrDegree: 'Lead UX Designer', startDate: '2018-07-01', description: 'Led design for major client projects.' },
      { id: 'comp2-sl', institutionName: 'Freelance Designer', roleOrDegree: 'UX Consultant', startDate: '2015-06-01', endDate: '2018-06-30', description: 'Worked with various startups.' },
    ],
    yearsOfExperience: 7,
    availabilitySlots: [
      { id: 'slot-sl1', startTime: '2024-11-04T10:00:00.000Z', endTime: '2024-11-04T11:30:00.000Z', isBooked: false },
      { id: 'slot-sl2', startTime: '2024-11-05T15:00:00.000Z', endTime: '2024-11-05T16:00:00.000Z', isBooked: true, bookedByMenteeId: 'mentee1' },
    ],
    mentorshipFocus: ['career', 'university'],
    targetDegreeLevels: ['Bachelors', 'Masters'],
    applicationExpertise: ['Portfolio Curation', 'Design School Applications', 'Personal Statements (Design)'],
  } as MentorProfile,
};

// Raw initial data (no direct MOCK_USERS access here)
const INITIAL_MOCK_GROUP_SESSIONS_RAW: Omit<GroupSession, 'id' | 'hostName' | 'hostProfileImageUrl' | 'participantCount' | 'duration'>[] = [
  {
    title: 'Mastering Data Structures & Algorithms',
    description: 'Join our interactive group session to tackle common DSA problems and improve your coding interview skills. Collaborative problem-solving, weekly challenges, and mock interview practice. This session is ideal for students preparing for technical interviews or looking to strengthen their fundamental computer science knowledge. We will cover arrays, linked lists, trees, graphs, sorting, searching, and dynamic programming.',
    hostId: 'mentor1',
    date: 'November 5th, 2024 at 4:00 PM PST',
    tags: ['DSA', 'Coding Interview', 'Algorithms', 'Problem Solving', 'Data Structures'],
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxncm91cCUyMGxlYXJuaW5nJTIwY29sbGFib3JhdGlvbnxlbnwwfHx8fDE3NDkzMDg3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    maxParticipants: 15,
    price: '$25',
  },
  {
    title: 'Startup Pitch Practice & Feedback',
    description: 'Refine your startup pitch in a supportive group environment. Get constructive feedback from peers and an experienced entrepreneur. Learn how to structure your pitch, tell a compelling story, and answer tough questions from investors. Each participant will have a chance to present and receive tailored advice.',
    hostId: 'mentor1',
    date: 'November 12th, 2024 at 10:00 AM PST',
    tags: ['Startup', 'Pitching', 'Entrepreneurship', 'Feedback', 'Business'],
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8Z3JvdXAlMjBsZWFybmluZyUyMGNvbGxhYm9yYXRpb258ZW58MHx8fHwxNzQ5MzA4NzAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    maxParticipants: 10,
    price: '$20',
  },
  {
    title: 'Intro to UX Design Principles',
    description: 'A beginner-friendly group session covering the fundamentals of UX design. Learn about user research, persona creation, wireframing, prototyping, and usability testing. We will work through a mini-project to apply these concepts.',
    hostId: 'mentor2',
    date: 'November 19th, 2024 at 1:00 PM PST',
    tags: ['UX Design', 'Beginner', 'UI/UX', 'Design Thinking', 'Prototyping'],
    imageUrl: 'https://placehold.co/600x400.png', // This one remains placeholder as only 2 new images were provided
    maxParticipants: 20,
    price: 'Free',
  }
];

const INITIAL_MOCK_WEBINARS_RAW: Omit<Webinar, 'id' | 'speakerName' | 'hostProfileImageUrl' | 'duration'>[] = [
  {
    title: 'The Future of Generative AI',
    description: 'Explore the latest advancements in Generative AI, its applications, and ethical considerations. Led by a leading AI researcher.',
    hostId: 'mentor1',
    date: 'November 8th, 2024 at 9:00 AM PST',
    topic: 'Artificial Intelligence',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw2fHxwcmVzZW50YXRpb24lMjBvbmxpbmUlMjBsZWFybmluZ3xlbnwwfHx8fDE3NDkzMDg3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    title: 'Effective Networking in the Tech Industry',
    description: 'Learn strategies for building meaningful professional connections, both online and offline, to advance your career in tech.',
    hostId: 'mentor2',
    date: 'November 15th, 2024 at 12:00 PM PST',
    topic: 'Career Development',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwcmVzZW50YXRpb24lMjBvbmxpbmUlMjBsZWFybmluZ3xlbnwwfHx8fDE3NDkzMDg3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  },
  {
    title: 'Demystifying Cloud Computing',
    description: 'A comprehensive overview of cloud computing concepts, services (AWS, Azure, GCP), and how to get started with cloud technologies.',
    hostId: 'mentor1',
    date: 'November 22nd, 2024 at 3:00 PM PST',
    topic: 'Cloud Computing',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxwcmVzZW50YXRpb24lMjBvbmxpbmUlMjBsZWFybmluZ3xlbnwwfHx8fDE3NDkzMDg3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
  }
];


// Helper function to enrich initial data
function enrichInitialData<
  T extends { hostId: string; id?: string; participantCount?: number; duration?: string },
  R extends T & { id: string; hostName?: string; speakerName?: string; hostProfileImageUrl?: string; participantCount: number; duration: string }
>(
  rawData: Omit<T, 'id' | 'hostName' | 'speakerName' | 'hostProfileImageUrl' | 'participantCount' | 'duration'>[],
  mockUsersData: Record<string, UserProfile>, // Explicitly pass MOCK_USERS here
  type: 'groupSession' | 'webinar'
): R[] {
  return rawData.map((item, index) => {
    const host = mockUsersData[item.hostId] || Object.values(mockUsersData).find(u => u.id === item.hostId);
    const baseId = type === 'groupSession' ? 'gs-initial-' : 'web-initial-';
    const enrichedItem: R = {
      ...item,
      id: item.id || `${baseId}${index + 1}-${Date.now()}`,
      participantCount: item.participantCount || 0,
      duration: item.duration || "Not specified",
    } as R;

    if (host) {
      if (type === 'groupSession') {
        enrichedItem.hostName = host.name;
      } else if (type === 'webinar') {
        enrichedItem.speakerName = host.name;
      }
      enrichedItem.hostProfileImageUrl = host.profileImageUrl;
    } else {
      if (type === 'groupSession') {
        enrichedItem.hostName = "Unknown Host";
      } else if (type === 'webinar') {
        enrichedItem.speakerName = "Unknown Speaker";
      }
    }
    return enrichedItem;
  });
}

interface AuthContextType {
  user: UserProfile | null;
  MOCK_USERS_INSTANCE: Record<string, UserProfile>;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  completeProfile: (profileData: Partial<UserProfile>, role: UserRole) => Promise<void>;
  getScheduledSessionsForCurrentUser: () => Promise<EnrichedBooking[]>;
  confirmBooking: (mentorEmail: string, slotId: string) => Promise<void>;
  updateMentorAvailability: (mentorId: string, newSlots: AvailabilitySlot[]) => Promise<void>;
  bookingsVersion: number;
  masterGroupSessionsList: GroupSession[];
  sessionsVersion: number;
  createGroupSession: (sessionData: Omit<GroupSession, 'id' | 'hostId' | 'participantCount' | 'hostName' | 'hostProfileImageUrl'>) => Promise<GroupSession>;
  getGroupSessionsByMentor: (mentorId: string) => Promise<GroupSession[]>;
  getGroupSessionDetails: (sessionId: string) => Promise<GroupSession | undefined>;
  deleteMentorGroupSession: (sessionId: string) => Promise<void>;
  updateMentorGroupSession: (sessionId: string, sessionData: Partial<Omit<GroupSession, 'id' | 'hostId' | 'hostName' | 'hostProfileImageUrl' | 'participantCount'>>) => Promise<GroupSession | undefined>;
  getAllGroupSessions: () => Promise<GroupSession[]>;
  masterWebinarsList: Webinar[];
  webinarsVersion: number;
  createWebinar: (webinarData: Omit<Webinar, 'id' | 'hostId' | 'hostProfileImageUrl'>) => Promise<Webinar>;
  getWebinarsByMentor: (mentorId: string) => Promise<Webinar[]>;
  getWebinarDetails: (webinarId: string) => Promise<Webinar | undefined>;
  deleteMentorWebinar: (webinarId: string) => Promise<void>;
  getAllWebinars: () => Promise<Webinar[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingsVersion, setBookingsVersion] = useState(0);
  const [sessionsVersion, setSessionsVersion] = useState(0);
  const [webinarsVersion, setWebinarsVersion] = useState(0);

  const [currentMockUsers, setCurrentMockUsers] = useState<Record<string, UserProfile>>(() => {
     if (typeof window !== 'undefined') {
        const storedMockUsers = localStorage.getItem('vedkarn-MOCK_USERS');
        if (storedMockUsers) {
            try {
                // Ensure MOCK_USERS from localStorage also has static dates if it's ever manually edited or from an old version
                const parsedUsers = JSON.parse(storedMockUsers) as Record<string, UserProfile>;
                Object.values(parsedUsers).forEach(u => {
                    if (u.role === 'mentor' && (u as MentorProfile).availabilitySlots) {
                        (u as MentorProfile).availabilitySlots = ((u as MentorProfile).availabilitySlots || []).map(slot => ({
                            ...slot,
                            startTime: slot.startTime, // Assuming they are already ISO strings
                            endTime: slot.endTime,     // Or add validation/conversion if needed
                        }));
                    }
                });
                return parsedUsers;
            } catch (e) {
                console.error("Failed to parse MOCK_USERS from localStorage", e);
            }
        }
    }
    // For initial load or if localStorage fails, use the module-level MOCK_USERS with static dates
    return JSON.parse(JSON.stringify(MOCK_USERS));
  });


  const [masterGroupSessionsList, setMasterGroupSessionsList] = useState<GroupSession[]>(() => {
    if (typeof window !== 'undefined') {
      const storedSessions = localStorage.getItem('vedkarn-group-sessions');
      if (storedSessions) {
        try {
           const parsedSessions = JSON.parse(storedSessions) as GroupSession[];
           // Ensure data loaded from localStorage is also enriched if it's missing derived fields
           // This check is simplified; a more robust check would verify specific derived fields.
           if (parsedSessions.length > 0 && (!parsedSessions[0].hostName || !parsedSessions[0].hostProfileImageUrl)) {
             return enrichInitialData(parsedSessions, currentMockUsers, 'groupSession'); // Pass currentMockUsers
           }
          return parsedSessions;
        } catch (e) {
          console.error("Failed to parse group sessions from localStorage", e);
        }
      }
    }
    return enrichInitialData(INITIAL_MOCK_GROUP_SESSIONS_RAW, MOCK_USERS, 'groupSession');
  });

  const [masterWebinarsList, setMasterWebinarsList] = useState<Webinar[]>(() => {
    if (typeof window !== 'undefined') {
      const storedWebinars = localStorage.getItem('vedkarn-webinars');
      if (storedWebinars) {
        try {
          const parsedWebinars = JSON.parse(storedWebinars) as Webinar[];
           if (parsedWebinars.length > 0 && (!parsedWebinars[0].speakerName || !parsedWebinars[0].hostProfileImageUrl)) {
             return enrichInitialData(parsedWebinars, currentMockUsers, 'webinar'); // Pass currentMockUsers
           }
          return parsedWebinars;
        } catch (e) {
          console.error("Failed to parse webinars from localStorage", e);
        }
      }
    }
    return enrichInitialData(INITIAL_MOCK_WEBINARS_RAW, MOCK_USERS, 'webinar');
  });

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('vedkarn-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser.id === 'string' && typeof parsedUser.email === 'string') {
          const mockUserDataFromDB = currentMockUsers[parsedUser.email];
           if (mockUserDataFromDB) {
            const mergedUser = { ...mockUserDataFromDB, ...parsedUser };
            if (mergedUser.role === 'mentor') {
              if (!(mergedUser as MentorProfile).availabilitySlots) {
                (mergedUser as MentorProfile).availabilitySlots = (mockUserDataFromDB as MentorProfile)?.availabilitySlots || [];
              }
               (mergedUser as MentorProfile).mentorshipFocus = (mergedUser as MentorProfile).mentorshipFocus || (mockUserDataFromDB as MentorProfile).mentorshipFocus || [];
            } else if (mergedUser.role === 'mentee') {
               (mergedUser as MenteeProfile).seekingMentorshipFor = (mergedUser as MenteeProfile).seekingMentorshipFor || (mockUserDataFromDB as MenteeProfile).seekingMentorshipFor || [];
            }
            setUser(mergedUser);
          } else {
            setUser(parsedUser);
            setCurrentMockUsers(prev => ({ ...prev, [parsedUser.email]: parsedUser }));
          }
        } else {
          localStorage.removeItem('vedkarn-user');
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('vedkarn-user');
      }
    }
    setLoading(false);
  }, []); // currentMockUsers removed from dependency to avoid re-initialization loop

   useEffect(() => {
    if(!loading && typeof window !== 'undefined') {
        localStorage.setItem('vedkarn-group-sessions', JSON.stringify(masterGroupSessionsList));
    }
  }, [masterGroupSessionsList, loading]);

  useEffect(() => {
    if(!loading && typeof window !== 'undefined') {
        localStorage.setItem('vedkarn-webinars', JSON.stringify(masterWebinarsList));
    }
  }, [masterWebinarsList, loading]);

  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
        localStorage.setItem('vedkarn-MOCK_USERS', JSON.stringify(currentMockUsers));
    }
  }, [currentMockUsers, loading]);


  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname.startsWith('/auth');
    const isRootPage = pathname === '/';
    const isLandingPagePath = pathname === '/landingpage';
    const isHowItWorksPage = pathname === '/how-it-works';
    const isApiRoute = pathname.startsWith('/api');

    if (!user) {
      if (!isRootPage && !isHowItWorksPage && !isAuthPage && !isApiRoute && !isLandingPagePath) {
        router.push('/auth/signin');
      }
    } else {
      if (!user.role && pathname !== '/auth/complete-profile' && !isApiRoute) {
        router.push('/auth/complete-profile');
      } else if (user.role && isAuthPage && pathname !== '/auth/complete-profile') { // Allow access to complete-profile even if role exists
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, pathname]);

  const login = useCallback(async (email: string, initialRole?: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    let userToLogin = currentMockUsers[email];

    if (userToLogin) {
      if (initialRole && userToLogin.role !== initialRole) {
        userToLogin = { ...userToLogin, role: initialRole, name: userToLogin.name || email.split('@')[0] };
      } else if (!userToLogin.name && email) {
        userToLogin = { ...userToLogin, name: email.split('@')[0]};
      }
      
      if (userToLogin.role === 'mentor') {
        userToLogin = {
            ...MOCK_USERS[email] as MentorProfile, // Use module MOCK_USERS for base structure
            ...userToLogin
        };
        if (!(userToLogin as MentorProfile).availabilitySlots) {
          (userToLogin as MentorProfile).availabilitySlots = (MOCK_USERS[email] as MentorProfile)?.availabilitySlots || [];
        }
      } else if (userToLogin.role === 'mentee') {
         userToLogin = {
            ...MOCK_USERS[email] as MenteeProfile, // Use module MOCK_USERS for base structure
            ...userToLogin
        };
      }
      setCurrentMockUsers(prev => ({ ...prev, [email]: userToLogin! }));

    } else {
      const newUserProfile: UserProfile = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email,
        name: email.split('@')[0],
        role: initialRole || null,
        profileImageUrl: 'https://placehold.co/100x100.png',
        bio: '',
        interests: [],
      };

      if (initialRole === 'mentor') {
        (newUserProfile as Partial<MentorProfile>).expertise = [];
        (newUserProfile as Partial<MentorProfile>).universities = [];
        (newUserProfile as Partial<MentorProfile>).companies = [];
        (newUserProfile as Partial<MentorProfile>).availabilitySlots = [];
        (newUserProfile as Partial<MentorProfile>).yearsOfExperience = 0;
        (newUserProfile as Partial<MentorProfile>).mentorshipFocus = [];
      } else if (initialRole === 'mentee') {
        (newUserProfile as Partial<MenteeProfile>).learningGoals = '';
        (newUserProfile as Partial<MenteeProfile>).desiredUniversities = [];
        (newUserProfile as Partial<MenteeProfile>).desiredJobRoles = [];
        (newUserProfile as Partial<MenteeProfile>).desiredCompanies = [];
        (newUserProfile as Partial<MenteeProfile>).seekingMentorshipFor = [];
      }
      setCurrentMockUsers(prev => ({ ...prev, [email]: newUserProfile }));
      userToLogin = newUserProfile;
    }

    setUser(userToLogin);
    localStorage.setItem('vedkarn-user', JSON.stringify(userToLogin));

    if (!userToLogin.role) {
      router.push('/auth/complete-profile');
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  }, [currentMockUsers, router]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('vedkarn-user');
    router.push('/auth/signin');
  }, [router]);

  const updateUserProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    if (user && user.email && currentMockUsers[user.email]) {
      const updatedUser = { ...currentMockUsers[user.email], ...profileData };
      setCurrentMockUsers(prev => ({ ...prev, [user.email!]: updatedUser }));
      setUser(updatedUser);
      localStorage.setItem('vedkarn-user', JSON.stringify(updatedUser));
    } else {
        throw new Error("User not found or not logged in for profile update.");
    }
  }, [user, currentMockUsers]);


  const completeProfile = useCallback(async (profileData: Partial<UserProfile>, role: UserRole) => {
    if (user && user.email && currentMockUsers[user.email]) {
      let completedProfile: UserProfile = { ...currentMockUsers[user.email], ...profileData, role };

      if (role === 'mentor') {
        const mentorData = profileData as Partial<MentorProfile>;
        const existingMentorData = currentMockUsers[user.email] as MentorProfile;
        completedProfile = {
          ...existingMentorData,
          ...completedProfile,
          expertise: mentorData.expertise || existingMentorData.expertise || [],
          universities: mentorData.universities?.map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random().toString(16).slice(2)}`})) || existingMentorData.universities || [],
          companies: mentorData.companies?.map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random().toString(16).slice(2)}`})) || existingMentorData.companies || [],
          availabilitySlots: mentorData.availabilitySlots || existingMentorData.availabilitySlots || [],
          yearsOfExperience: mentorData.yearsOfExperience ?? existingMentorData.yearsOfExperience ?? 0,
          mentorshipFocus: mentorData.mentorshipFocus || existingMentorData.mentorshipFocus || [],
          targetDegreeLevels: mentorData.targetDegreeLevels || existingMentorData.targetDegreeLevels || [],
          guidedUniversities: mentorData.guidedUniversities || existingMentorData.guidedUniversities || [],
          applicationExpertise: mentorData.applicationExpertise || existingMentorData.applicationExpertise || [],
          role: 'mentor',
        };
      } else if (role === 'mentee') {
         const menteeData = profileData as Partial<MenteeProfile>;
         const existingMenteeData = currentMockUsers[user.email] as MenteeProfile;
        completedProfile = {
          ...existingMenteeData,
          ...completedProfile,
          learningGoals: menteeData.learningGoals || existingMenteeData.learningGoals || '',
          desiredUniversities: menteeData.desiredUniversities || existingMenteeData.desiredUniversities || [],
          desiredJobRoles: menteeData.desiredJobRoles || existingMenteeData.desiredJobRoles || [],
          desiredCompanies: menteeData.desiredCompanies || existingMenteeData.desiredCompanies || [],
          seekingMentorshipFor: menteeData.seekingMentorshipFor || existingMenteeData.seekingMentorshipFor || [],
          currentEducationLevel: menteeData.currentEducationLevel || existingMenteeData.currentEducationLevel,
          targetDegreeLevel: menteeData.targetDegreeLevel || existingMenteeData.targetDegreeLevel,
          targetFieldsOfStudy: menteeData.targetFieldsOfStudy || existingMenteeData.targetFieldsOfStudy || [],
          role: 'mentee',
        };
      } else {
        completedProfile.role = null;
      }

      setCurrentMockUsers(prev => ({ ...prev, [user.email!]: completedProfile }));
      setUser(completedProfile);
      localStorage.setItem('vedkarn-user', JSON.stringify(completedProfile));
      router.push('/dashboard');
    } else {
        throw new Error("User not found or not logged in for profile completion.");
    }
  }, [user, router, currentMockUsers]);


  const confirmBooking = useCallback(async (mentorEmail: string, slotId: string): Promise<void> => {
    if (!user || user.role !== 'mentee') {
      throw new Error("Only mentees can book sessions.");
    }
    const menteeId = user.id;
    
    setCurrentMockUsers(prevMockUsers => {
        const mentorToUpdate = prevMockUsers[mentorEmail] as MentorProfile | undefined;
        if (mentorToUpdate && mentorToUpdate.availabilitySlots) {
            const slotIndex = mentorToUpdate.availabilitySlots.findIndex(s => s.id === slotId);
            if (slotIndex > -1 && !mentorToUpdate.availabilitySlots[slotIndex].isBooked) {
                const updatedSlots = mentorToUpdate.availabilitySlots.map((slot, index) =>
                index === slotIndex ? { ...slot, isBooked: true, bookedByMenteeId: menteeId } : slot
                );
                const updatedMentor = { ...mentorToUpdate, availabilitySlots: updatedSlots };
                const newMockUsers = { ...prevMockUsers, [mentorEmail]: updatedMentor };
                
                if (user && user.email === mentorEmail) { 
                    setUser(updatedMentor); 
                    localStorage.setItem('vedkarn-user', JSON.stringify(updatedMentor)); 
                }
                setBookingsVersion(v => v + 1); 
                return newMockUsers;
            } else {
                throw new Error("Slot not found or already booked.");
            }
        }
        throw new Error("Mentor not found.");
    });
  }, [user]);


  const getScheduledSessionsForCurrentUser = useCallback(async (): Promise<EnrichedBooking[]> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    if (!user) return [];

    const scheduledSessions: EnrichedBooking[] = [];
    const allUserProfiles = Object.values(currentMockUsers);

    for (const profile of allUserProfiles) {
      if (profile.role === 'mentor') {
        const mentorProfile = profile as MentorProfile;
        if (mentorProfile.availabilitySlots) {
          for (const slot of mentorProfile.availabilitySlots) {
            if (slot.isBooked && slot.bookedByMenteeId) {
              if (user.id === mentorProfile.id || user.id === slot.bookedByMenteeId) {
                const menteeProfile = allUserProfiles.find(u => u.id === slot.bookedByMenteeId && u.role === 'mentee') as MenteeProfile | undefined;
                if (menteeProfile) { 
                  scheduledSessions.push({
                    id: `${mentorProfile.id}-${slot.id}`,
                    mentorId: mentorProfile.id,
                    menteeId: menteeProfile.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status: 'confirmed',
                    mentor: mentorProfile,
                    mentee: menteeProfile,
                    sessionTitle: user.role === 'mentor'
                                  ? `Session with ${menteeProfile.name}`
                                  : `Session with ${mentorProfile.name}`,
                    meetingNotes: `Mentorship session: ${mentorProfile.name} & ${menteeProfile.name}. Focus: ${slot.id}`
                  });
                }
              }
            }
          }
        }
      }
    }
    return scheduledSessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [user, currentMockUsers]);

  const updateMentorAvailability = useCallback(async (mentorId: string, newSlots: AvailabilitySlot[]): Promise<void> => {
     setCurrentMockUsers(prevMockUsers => {
        const mentorEmail = Object.keys(prevMockUsers).find(email => prevMockUsers[email].id === mentorId);
        if (mentorEmail && prevMockUsers[mentorEmail] && prevMockUsers[mentorEmail].role === 'mentor') {
            const updatedMentor = { ...prevMockUsers[mentorEmail] as MentorProfile, availabilitySlots: newSlots };
            const newMockUsers = { ...prevMockUsers, [mentorEmail]: updatedMentor };

            if (user && user.id === mentorId) {
                setUser(updatedMentor);
                localStorage.setItem('vedkarn-user', JSON.stringify(updatedMentor));
            }
            setBookingsVersion(v => v + 1);
            return newMockUsers;
        }
        throw new Error("Mentor not found or invalid ID for updating availability.");
     });
  }, [user]);

  const createGroupSession = useCallback(async (
    sessionData: Omit<GroupSession, 'id' | 'hostId' | 'participantCount' | 'hostName' | 'hostProfileImageUrl'>
  ): Promise<GroupSession> => {
    if (!user || user.role !== 'mentor') {
      throw new Error("Only mentors can create group sessions.");
    }
    const newSession: GroupSession = {
      ...sessionData,
      id: `gs-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      hostId: user.id,
      hostName: user.name,
      hostProfileImageUrl: user.profileImageUrl,
      participantCount: 0,
      duration: sessionData.duration || "Not specified",
    };
    setMasterGroupSessionsList(prevSessions => [...prevSessions, newSession]);
    setSessionsVersion(v => v + 1);
    return newSession;
  }, [user]);

  const getGroupSessionsByMentor = useCallback(async (mentorId: string): Promise<GroupSession[]> => {
    return masterGroupSessionsList.filter(session => session.hostId === mentorId);
  }, [masterGroupSessionsList]);

  const getGroupSessionDetails = useCallback(async (sessionId: string): Promise<GroupSession | undefined> => {
    return masterGroupSessionsList.find(session => session.id === sessionId);
  }, [masterGroupSessionsList]);

  const getAllGroupSessions = useCallback(async (): Promise<GroupSession[]> => {
    return [...masterGroupSessionsList].sort((a,b) => {
        try {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (e) {
            return 0;
        }
    });
  }, [masterGroupSessionsList]);

  const deleteMentorGroupSession = useCallback(async (sessionId: string): Promise<void> => {
    if (!user || user.role !== 'mentor') {
      throw new Error("User not authorized to delete sessions.");
    }
    const sessionToDelete = masterGroupSessionsList.find(s => s.id === sessionId);
    if (!sessionToDelete) {
        throw new Error("Session not found.");
    }
    if (sessionToDelete.hostId !== user.id) {
      throw new Error("Mentor can only delete their own sessions.");
    }

    setMasterGroupSessionsList(prevSessions => prevSessions.filter(session => session.id !== sessionId));
    setSessionsVersion(v => v + 1);
  }, [user, masterGroupSessionsList]);

  const updateMentorGroupSession = useCallback(async (
    sessionId: string, 
    sessionData: Partial<Omit<GroupSession, 'id' | 'hostId' | 'hostName' | 'hostProfileImageUrl' | 'participantCount'>>
  ): Promise<GroupSession | undefined> => {
    if (!user || user.role !== 'mentor') {
      throw new Error("Only mentors can update group sessions.");
    }
    let updatedSession: GroupSession | undefined;
    setMasterGroupSessionsList(prevSessions => 
      prevSessions.map(session => {
        if (session.id === sessionId) {
          if (session.hostId !== user.id) {
            throw new Error("Mentor can only update their own sessions.");
          }
          updatedSession = { ...session, ...sessionData };
          return updatedSession;
        }
        return session;
      })
    );
    if (updatedSession) {
        setSessionsVersion(v => v + 1);
    } else {
        throw new Error("Session not found or update failed.");
    }
    return updatedSession;
  }, [user]);


  const createWebinar = useCallback(async (
    webinarData: Omit<Webinar, 'id' | 'hostId' | 'hostProfileImageUrl'>
  ): Promise<Webinar> => {
    if (!user || user.role !== 'mentor') {
      throw new Error("Only mentors can create webinars.");
    }
    const newWebinar: Webinar = {
      ...webinarData,
      id: `web-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      hostId: user.id,
      speakerName: webinarData.speakerName || user.name, 
      hostProfileImageUrl: user.profileImageUrl,
      duration: webinarData.duration || "Not specified",
    };
    setMasterWebinarsList(prevWebinars => [...prevWebinars, newWebinar]);
    setWebinarsVersion(v => v + 1);
    return newWebinar;
  }, [user]);

  const getWebinarsByMentor = useCallback(async (mentorId: string): Promise<Webinar[]> => {
    return masterWebinarsList.filter(webinar => webinar.hostId === mentorId);
  }, [masterWebinarsList]);

  const getWebinarDetails = useCallback(async (webinarId: string): Promise<Webinar | undefined> => {
    return masterWebinarsList.find(webinar => webinar.id === webinarId);
  }, [masterWebinarsList]);

  const getAllWebinars = useCallback(async (): Promise<Webinar[]> => {
     return [...masterWebinarsList].sort((a,b) => {
        try {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (e) {
            return 0;
        }
    });
  }, [masterWebinarsList]);

  const deleteMentorWebinar = useCallback(async (webinarId: string): Promise<void> => {
    if (!user || user.role !== 'mentor') {
      throw new Error("User not authorized to delete webinars.");
    }
    const webinarToDelete = masterWebinarsList.find(w => w.id === webinarId);
     if (!webinarToDelete) {
        throw new Error("Webinar not found.");
    }
    if (webinarToDelete.hostId !== user.id) {
      throw new Error("Mentor can only delete their own webinars.");
    }
    setMasterWebinarsList(prevWebinars => prevWebinars.filter(webinar => webinar.id !== webinarId));
    setWebinarsVersion(v => v + 1);
  }, [user, masterWebinarsList]);


  return (
    <AuthContext.Provider value={{
      user,
      MOCK_USERS_INSTANCE: currentMockUsers,
      loading,
      login,
      logout,
      updateUserProfile,
      completeProfile,
      getScheduledSessionsForCurrentUser,
      confirmBooking,
      updateMentorAvailability,
      bookingsVersion,
      masterGroupSessionsList,
      sessionsVersion,
      createGroupSession,
      getGroupSessionsByMentor,
      getGroupSessionDetails,
      deleteMentorGroupSession,
      updateMentorGroupSession,
      getAllGroupSessions,
      masterWebinarsList,
      webinarsVersion,
      createWebinar,
      getWebinarsByMentor,
      getWebinarDetails,
      deleteMentorWebinar,
      getAllWebinars,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const getMockMentorProfiles = (): string[] => {
  return Object.values(MOCK_USERS)
    .filter(u => u.role === 'mentor')
    .map(userProfile => {
      const m = userProfile as MentorProfile;
      const universities = m.universities?.map(u => `${u.roleOrDegree} at ${u.institutionName}`).join('; ') || 'N/A';
      const companies = m.companies?.map(c => `${c.roleOrDegree} at ${c.institutionName}`).join('; ') || 'N/A';
      let profileString = `Name: ${m.name}, Bio: ${m.bio || 'N/A'}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${universities}, Companies: ${companies}, Years of Exp: ${m.yearsOfExperience || 0}`;
      profileString += `, Mentorship Focus: ${m.mentorshipFocus?.join(', ') || 'N/A'}`;
      if (m.mentorshipFocus?.includes('university')) {
        profileString += `, Target Degree Levels: ${m.targetDegreeLevels?.join(', ') || 'N/A'}`;
        profileString += `, Guided Universities: ${m.guidedUniversities?.join(', ') || 'N/A'}`;
        profileString += `, Application Expertise: ${m.applicationExpertise?.join(', ') || 'N/A'}`;
      }
      return profileString;
    });
};

export const getMentorByProfileString = (profileString: string): MentorProfile | undefined => {
  const nameMatch = profileString.match(/Name: (.*?)(?:, Bio:|, Expertise:|$)/);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    const foundUser = Object.values(MOCK_USERS).find(u => u.role === 'mentor' && u.name === name);
    return foundUser ? MOCK_USERS[foundUser.email] as MentorProfile : undefined; 
  }
  return undefined;
};

    

