
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
      { id: 'slot1', startTime: new Date(Date.now() + 1 * 24 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() + (1 * 24 + 1) * 3600 * 1000).toISOString(), isBooked: false}, // Tomorrow
      { id: 'slot2', startTime: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() + (2 * 24 + 1) * 3600 * 1000).toISOString(), isBooked: false }, // Day after tomorrow
      { id: 'slot3', startTime: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() + (3 * 24 + 1) * 3600 * 1000).toISOString(), isBooked: false }, // In 3 days
      { id: 'slot-past-booked', startTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), endTime: new Date(Date.now() - (24 - 1) * 3600 * 1000).toISOString(), isBooked: true, bookedByMenteeId: 'mentee1' }, // A past session
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
  getScheduledSessionsForCurrentUser: () => Promise<EnrichedBooking[]>;
  confirmBooking: (mentorEmail: string, slotId: string) => Promise<void>;
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
             // Ensure availabilitySlots are present for mentors from MOCK_USERS
            const mockUserData = MOCK_USERS[parsedUser.email];
            if (mockUserData.role === 'mentor' && !(mockUserData as MentorProfile).availabilitySlots) {
              (mockUserData as MentorProfile).availabilitySlots = [];
            }
            setUser({ ...mockUserData, ...parsedUser }); // Prioritize localStorage for basic fields, but MOCK_USERS for slots
          } else {
            setUser(parsedUser); 
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
      // Ensure availabilitySlots for mentors
      if (foundUser.role === 'mentor' && !(foundUser as MentorProfile).availabilitySlots) {
        (foundUser as MentorProfile).availabilitySlots = (MOCK_USERS[email] as MentorProfile)?.availabilitySlots || [];
      }

      setUser(foundUser);
      localStorage.setItem('vedkarn-user', JSON.stringify(foundUser));
      if (!foundUser.role) {
        router.push('/auth/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } else {
      const newUserProfile: UserProfile = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        email,
        name: initialRole ? email.split('@')[0] : "New User", 
        role: initialRole || null,
        profileImageUrl: 'https://placehold.co/100x100.png', 
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
      const updatedUserInDb = { ...MOCK_USERS[user.email], ...profileData };
      MOCK_USERS[user.email] = updatedUserInDb;
      
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

  const confirmBooking = async (mentorEmail: string, slotId: string): Promise<void> => {
    if (!user || user.role !== 'mentee') {
      return Promise.reject(new Error("Only mentees can book sessions."));
    }
    const menteeId = user.id;

    const mentorToUpdate = MOCK_USERS[mentorEmail] as MentorProfile;

    if (mentorToUpdate && mentorToUpdate.availabilitySlots) {
      const slotIndex = mentorToUpdate.availabilitySlots.findIndex(s => s.id === slotId);
      if (slotIndex > -1 && !mentorToUpdate.availabilitySlots[slotIndex].isBooked) {
        
        // Create new array for slots to ensure state update immutability if needed elsewhere
        const updatedSlots = mentorToUpdate.availabilitySlots.map((slot, index) => 
          index === slotIndex ? { ...slot, isBooked: true, bookedByMenteeId: menteeId } : slot
        );
        
        // Directly update the MOCK_USERS object
        (MOCK_USERS[mentorEmail] as MentorProfile).availabilitySlots = updatedSlots;

        // If the current logged-in user *is* this mentor (for testing or other roles), update their context state
        if (user && user.email === mentorEmail) {
          const updatedCurrentUser = { ...MOCK_USERS[mentorEmail] }; // get the updated mentor profile
          setUser(updatedCurrentUser);
          localStorage.setItem('vedkarn-user', JSON.stringify(updatedCurrentUser));
        }
        
        return Promise.resolve();
      } else {
        return Promise.reject(new Error("Slot not found or already booked."));
      }
    }
    return Promise.reject(new Error("Mentor not found."));
  };

  const getScheduledSessionsForCurrentUser = async (): Promise<EnrichedBooking[]> => {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate async
    if (!user) return [];

    const scheduledSessions: EnrichedBooking[] = [];
    const allUserProfiles = Object.values(MOCK_USERS);

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
                    id: slot.id, 
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
                    meetingNotes: `Mentorship session between ${mentorProfile.name} and ${menteeProfile.name}. Topic: ${slot.id}` // Mock notes
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
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      updateUserProfile, 
      completeProfile, 
      getScheduledSessionsForCurrentUser,
      confirmBooking 
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
      return `Name: ${m.name}, Bio: ${m.bio || 'N/A'}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${m.universities?.map(u => `${u.roleOrDegree} at ${u.institutionName}`).join('; ') || 'N/A'}, Companies: ${m.companies?.map(c => `${c.roleOrDegree} at ${c.institutionName}`).join('; ') || 'N/A'}, Years of Exp: ${m.yearsOfExperience || 0}`;
    });
};

export const getMentorByProfileString = (profileString: string): MentorProfile | undefined => {
  const nameMatch = profileString.match(/Name: (.*?)(?:, Bio:|, Expertise:|$)/);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    const foundUser = Object.values(MOCK_USERS).find(u => u.role === 'mentor' && u.name === name);
    return foundUser ? MOCK_USERS[foundUser.email] as MentorProfile : undefined; // Return from MOCK_USERS to ensure it's the shared ref
  }
  return undefined;
};

    