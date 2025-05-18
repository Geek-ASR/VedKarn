"use client";

import type { UserProfile, UserRole, MentorProfile, MenteeProfile, EnrichedBooking, AvailabilitySlot, Booking } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock user data (replace with actual API calls)
// Ensure MOCK_USERS is accessible for getScheduledSessionsForUser or pass it
// For simplicity in this context, it's defined here.
// In a real app, this would come from a DB or API.
export const MOCK_USERS: Record<string, UserProfile> = {
  'mentor@example.com': {
    id: 'mentor1',
    email: 'mentor@example.com',
    name: 'Dr. Eleanor Vance',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Experienced AI researcher with a passion for guiding students. Specializing in Machine Learning and Natural Language Processing.',
    interests: ['AI Ethics', 'Deep Learning', 'Academic Research'],
    expertise: ['Machine Learning', 'NLP', 'Computer Vision'],
    universities: [
      { id: 'uni1', institutionName: 'Stanford University', roleOrDegree: 'PhD in AI', startDate: '2010-09-01', endDate: '2014-06-01', description: 'Focused on novel neural network architectures.' },
      { id: 'uni2', institutionName: 'MIT', roleOrDegree: 'M.S. Computer Science', startDate: '2008-09-01', endDate: '2010-06-01' },
    ],
    companies: [
      { id: 'comp1', institutionName: 'Google AI', roleOrDegree: 'Senior Research Scientist', startDate: '2016-07-01', description: 'Led projects in large language model development.' },
      { id: 'comp2', institutionName: 'OpenAI', roleOrDegree: 'Research Engineer', startDate: '2014-07-01', endDate: '2016-06-30' },
    ],
    yearsOfExperience: 10,
    availabilitySlots: [
      { id: 'slot1', startTime: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() + 25 * 3600 * 1000).toISOString(), isBooked: false},
      { id: 'slot2', startTime: new Date(Date.now() + 48 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() + 49 * 3600 * 1000).toISOString(), isBooked: true, bookedByMenteeId: 'mentee1' },
      { id: 'slot3', startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() - 23 * 3600 * 1000).toISOString(), isBooked: true, bookedByMenteeId: 'mentee1' }, // A past session
    ]
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
  } as MenteeProfile,
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<UserProfile>) => void;
  completeProfile: (profileData: Partial<UserProfile>, role: UserRole) => void;
  getScheduledSessionsForCurrentUser: () => Promise<EnrichedBooking[]>; // New function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('vedkarn-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser.id === 'string' && typeof parsedUser.email === 'string') {
          // Sync with MOCK_USERS to get latest availability if it's a mentor
          if (MOCK_USERS[parsedUser.email]) {
            setUser(MOCK_USERS[parsedUser.email]);
          } else {
            setUser(parsedUser); // Fallback if user not in initial MOCK_USERS (e.g. newly created)
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
  }, []);

  useEffect(() => {
    if (loading) return; 

    const isAuthPage = pathname.startsWith('/auth');
    const isRootPage = pathname === '/';
    const isHowItWorksPage = pathname === '/how-it-works';
    const isApiRoute = pathname.startsWith('/api'); 
    
    if (!user && !isAuthPage && !isRootPage && !isHowItWorksPage && !isApiRoute) {
      router.push('/auth/signin');
    } else if (user && !user.role && pathname !== '/auth/complete-profile' && !isApiRoute) {
       router.push('/auth/complete-profile');
    }
  }, [user, loading, router, pathname]);

  const login = async (email: string, initialRole?: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    let foundUser = MOCK_USERS[email];
    
    if (foundUser) {
      if (initialRole && foundUser.role !== initialRole) {
        foundUser = { ...foundUser, role: initialRole, name: foundUser.name || email.split('@')[0] }; 
        MOCK_USERS[email] = foundUser; 
      } else if (!foundUser.name && email) { 
        foundUser = { ...foundUser, name: email.split('@')[0]};
        MOCK_USERS[email] = foundUser;
      }
      setUser(foundUser);
      localStorage.setItem('vedkarn-user', JSON.stringify(foundUser));
      if (!foundUser.role) {
        router.push('/auth/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } else {
      // If user not in MOCK_USERS, it's a new signup
      const newUserProfile: UserProfile = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email,
        name: initialRole ? email.split('@')[0] : "New User", // Set name if role provided at signup
        role: initialRole || null,
        profileImageUrl: 'https://placehold.co/100x100.png', // Default image
        bio: '',
        interests: [],
      };

      if (initialRole === 'mentor') {
        (newUserProfile as MentorProfile).expertise = [];
        (newUserProfile as MentorProfile).universities = [];
        (newUserProfile as MentorProfile).companies = [];
        (newUserProfile as MentorProfile).availabilitySlots = [];
        (newUserProfile as MentorProfile).yearsOfExperience = 0;
      } else if (initialRole === 'mentee') {
        (newUserProfile as MenteeProfile).learningGoals = '';
        (newUserProfile as MenteeProfile).desiredUniversities = [];
        (newUserProfile as MenteeProfile).desiredJobRoles = [];
        (newUserProfile as MenteeProfile).desiredCompanies = [];
      }
      
      MOCK_USERS[email] = newUserProfile;
      setUser(newUserProfile);
      localStorage.setItem('vedkarn-user', JSON.stringify(newUserProfile));
      if (!newUserProfile.role || (initialRole && !profileIsConsideredComplete(newUserProfile, initialRole))) {
         router.push('/auth/complete-profile');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };
  
  const profileIsConsideredComplete = (profile: UserProfile, role: UserRole): boolean => {
    if (!role) return false; 
    if (role === 'mentor' && (!(profile as MentorProfile).expertise || (profile as MentorProfile).expertise!.length === 0)) return false;
    if (role === 'mentee' && !(profile as MenteeProfile).learningGoals) return false;
    return true; 
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vedkarn-user');
    router.push('/auth/signin');
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (user) {
      // Directly update MOCK_USERS, as it's our source of truth for this session
      const updatedUserInDb = { ...MOCK_USERS[user.email], ...profileData };
      MOCK_USERS[user.email] = updatedUserInDb;
      
      // Update the user state and localStorage
      setUser(updatedUserInDb);
      localStorage.setItem('vedkarn-user', JSON.stringify(updatedUserInDb));
    }
  };
  
  const completeProfile = (profileData: Partial<UserProfile>, role: UserRole) => {
    if (user) {
      const baseProfile = { ...MOCK_USERS[user.email], ...profileData, role }; 
      let completedProfile: UserProfile;

      if (role === 'mentor') {
        completedProfile = {
          ...baseProfile,
          role: 'mentor',
          expertise: (profileData as Partial<MentorProfile>).expertise || (baseProfile as MentorProfile).expertise || [],
          universities: (profileData as Partial<MentorProfile>).universities || (baseProfile as MentorProfile).universities || [],
          companies: (profileData as Partial<MentorProfile>).companies || (baseProfile as MentorProfile).companies || [],
          availabilitySlots: (profileData as Partial<MentorProfile>).availabilitySlots || (baseProfile as MentorProfile).availabilitySlots || [],
          yearsOfExperience: (profileData as Partial<MentorProfile>).yearsOfExperience ?? (baseProfile as MentorProfile).yearsOfExperience ?? 0,
        } as MentorProfile;
      } else if (role === 'mentee') {
        completedProfile = {
          ...baseProfile,
          role: 'mentee',
          learningGoals: (profileData as Partial<MenteeProfile>).learningGoals || (baseProfile as MenteeProfile).learningGoals || '',
          desiredUniversities: (profileData as Partial<MenteeProfile>).desiredUniversities || (baseProfile as MenteeProfile).desiredUniversities || [],
          desiredJobRoles: (profileData as Partial<MenteeProfile>).desiredJobRoles || (baseProfile as MenteeProfile).desiredJobRoles || [],
          desiredCompanies: (profileData as Partial<MenteeProfile>).desiredCompanies || (baseProfile as MenteeProfile).desiredCompanies || [],
        } as MenteeProfile;
      } else {
        completedProfile = { ...baseProfile, role: null }; 
      }
      
      MOCK_USERS[user.email] = completedProfile; 
      setUser(completedProfile);
      localStorage.setItem('vedkarn-user', JSON.stringify(completedProfile));
      
      router.push('/dashboard');
    }
  };

  const getScheduledSessionsForCurrentUser = async (): Promise<EnrichedBooking[]> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // Simulate async
    if (!user) return [];

    const scheduledSessions: EnrichedBooking[] = [];
    const allUserProfiles = Object.values(MOCK_USERS);

    for (const profile of allUserProfiles) {
      if (profile.role === 'mentor') {
        const mentorProfile = profile as MentorProfile;
        if (mentorProfile.availabilitySlots) {
          for (const slot of mentorProfile.availabilitySlots) {
            if (slot.isBooked && slot.bookedByMenteeId) {
              // Check if current user is the mentor of this slot OR the mentee who booked it
              if (user.id === mentorProfile.id || user.id === slot.bookedByMenteeId) {
                const menteeProfile = allUserProfiles.find(u => u.id === slot.bookedByMenteeId);
                if (menteeProfile) {
                  scheduledSessions.push({
                    id: slot.id, // Use slot id as booking id for mock
                    mentorId: mentorProfile.id,
                    menteeId: menteeProfile.id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    status: 'confirmed', // Mock status
                    mentor: mentorProfile,
                    mentee: menteeProfile,
                    sessionTitle: user.role === 'mentor' 
                                  ? `Session with ${menteeProfile.name}` 
                                  : `Session with ${mentorProfile.name}`,
                    meetingNotes: `Mentorship session between ${mentorProfile.name} and ${menteeProfile.name}.`
                  });
                }
              }
            }
          }
        }
      }
    }
    return scheduledSessions.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile, completeProfile, getScheduledSessionsForCurrentUser }}>
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
      return `Name: ${m.name}, Bio: ${m.bio || 'N/A'}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${m.universities?.map(u => `${u.roleOrDegree} at ${u.institutionName}`).join('; ') || 'N/A'}, Companies: ${m.companies?.map(c => `${c.roleOrDegree} at ${c.institutionName}`).join('; ') || 'N/A'}, Years of Exp: ${m.yearsOfExperience || 0}`;
    });
};

export const getMentorByProfileString = (profileString: string): MentorProfile | undefined => {
  const nameMatch = profileString.match(/Name: (.*?)(?:, Bio:|, Expertise:|$)/);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    const foundUser = Object.values(MOCK_USERS).find(u => u.role === 'mentor' && u.name === name);
    return foundUser ? foundUser as MentorProfile : undefined;
  }
  return undefined;
};