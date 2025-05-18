"use client";

import type { UserProfile, UserRole, MentorProfile, MenteeProfile, EnrichedBooking, AvailabilitySlot, Booking, ExperienceItem } from '@/lib/types';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock user data (replace with actual API calls)
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
      { id: 'uni1-mv', institutionName: 'Stanford University', roleOrDegree: 'PhD in AI', startDate: '2010-09-01', endDate: '2014-06-01', description: 'Focused on novel neural network architectures.' },
      { id: 'uni2-mv', institutionName: 'MIT', roleOrDegree: 'M.S. Computer Science', startDate: '2008-09-01', endDate: '2010-06-01' },
    ],
    companies: [
      { id: 'comp1-mv', institutionName: 'Google AI', roleOrDegree: 'Senior Research Scientist', startDate: '2016-07-01', description: 'Led projects in large language model development.' },
      { id: 'comp2-mv', institutionName: 'OpenAI', roleOrDegree: 'Research Engineer', startDate: '2014-07-01', endDate: '2016-06-30' },
    ],
    yearsOfExperience: 10,
    availabilitySlots: [
      { id: 'slot1', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 1)).toISOString(), isBooked: false},
      { id: 'slot2', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 1)).toISOString(), isBooked: false },
      { id: 'slot3', startTime: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(new Date().getHours() + 1)).toISOString(), isBooked: false },
      { id: 'slot-past-booked', startTime: new Date(new Date().setDate(new Date().getDate() -1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() -1)).setHours(new Date().getHours() + 1)).toISOString(), isBooked: true, bookedByMenteeId: 'mentee1' },
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
   'mentor2@example.com': {
    id: 'mentor2',
    email: 'mentor2@example.com',
    name: 'Dr. Ben Carter',
    role: 'mentor',
    profileImageUrl: 'https://placehold.co/100x100.png',
    bio: 'Product Management expert with 12+ years in tech. Passionate about building great products and mentoring future leaders.',
    interests: ['Product Strategy', 'User Experience', 'Startups'],
    expertise: ['Product Management', 'Agile Development', 'Market Analysis', 'UX Strategy'],
    universities: [{ id: 'uni1-bc', institutionName: 'UC Berkeley', roleOrDegree: 'MBA', startDate: '2006-08-01', endDate: '2008-05-01', description: 'Emphasis on Technology Management.' }],
    companies: [
        { id: 'comp1-bc', institutionName: 'Salesforce', roleOrDegree: 'Director of Product', startDate: '2015-03-01', description: 'Led product strategy for key cloud services.' },
        { id: 'comp2-bc', institutionName: 'Adobe', roleOrDegree: 'Senior Product Manager', startDate: '2010-06-01', endDate: '2015-02-28', description: 'Managed flagship creative software products.' }
    ],
    yearsOfExperience: 12,
    availabilitySlots: [
      { id: 'slot4', startTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(new Date().getHours() + 2)).toISOString(), isBooked: false },
      { id: 'slot5', startTime: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(), endTime: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(new Date().getHours() + 2)).toISOString(), isBooked: false },
    ]
  } as MentorProfile,
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
  updateMentorAvailability: (mentorId: string, newSlots: AvailabilitySlot[]) => Promise<void>;
  bookingsVersion: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingsVersion, setBookingsVersion] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('vedkarn-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser.id === 'string' && typeof parsedUser.email === 'string') {
          if (MOCK_USERS[parsedUser.email]) {
            const mockUserDataFromDB = MOCK_USERS[parsedUser.email];
            const mergedUser = { ...mockUserDataFromDB, ...parsedUser };

            if (mergedUser.role === 'mentor' && !(mergedUser as MentorProfile).availabilitySlots) {
              (mergedUser as MentorProfile).availabilitySlots = (mockUserDataFromDB as MentorProfile)?.availabilitySlots || [];
            }
            setUser(mergedUser);
          } else {
            setUser(parsedUser);
            MOCK_USERS[parsedUser.email] = parsedUser;
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

    let userToLogin = MOCK_USERS[email];

    if (userToLogin) {
      if (initialRole && userToLogin.role !== initialRole) {
        userToLogin = { ...userToLogin, role: initialRole, name: userToLogin.name || email.split('@')[0] };
        MOCK_USERS[email] = userToLogin;
      } else if (!userToLogin.name && email) {
        userToLogin = { ...userToLogin, name: email.split('@')[0]};
        MOCK_USERS[email] = userToLogin;
      }
      if (userToLogin.role === 'mentor' && !(userToLogin as MentorProfile).availabilitySlots) {
        (userToLogin as MentorProfile).availabilitySlots = (MOCK_USERS[email] as MentorProfile)?.availabilitySlots || [];
      }
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
      } else if (initialRole === 'mentee') {
        (newUserProfile as Partial<MenteeProfile>).learningGoals = '';
        (newUserProfile as Partial<MenteeProfile>).desiredUniversities = [];
        (newUserProfile as Partial<MenteeProfile>).desiredJobRoles = [];
        (newUserProfile as Partial<MenteeProfile>).desiredCompanies = [];
      }
      MOCK_USERS[email] = newUserProfile;
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vedkarn-user');
    router.push('/auth/signin');
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (user && user.email && MOCK_USERS[user.email]) {
      const updatedUser = { ...MOCK_USERS[user.email], ...profileData };
      MOCK_USERS[user.email] = updatedUser;
      setUser(updatedUser);
      localStorage.setItem('vedkarn-user', JSON.stringify(updatedUser));
    }
  };

  const completeProfile = (profileData: Partial<UserProfile>, role: UserRole) => {
    if (user && user.email && MOCK_USERS[user.email]) {
      let completedProfile: UserProfile = { ...MOCK_USERS[user.email], ...profileData, role };

      if (role === 'mentor') {
        const mentorSpecifics: Partial<MentorProfile> = {
          expertise: (profileData as Partial<MentorProfile>).expertise || (completedProfile as MentorProfile).expertise || [],
          universities: (profileData as Partial<MentorProfile>).universities?.map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random()}`})) || (completedProfile as MentorProfile).universities || [],
          companies: (profileData as Partial<MentorProfile>).companies?.map(exp => ({ ...exp, id: exp.id || `exp-${Date.now()}-${Math.random()}`})) || (completedProfile as MentorProfile).companies || [],
          availabilitySlots: (profileData as Partial<MentorProfile>).availabilitySlots || (completedProfile as MentorProfile).availabilitySlots || [],
          yearsOfExperience: (profileData as Partial<MentorProfile>).yearsOfExperience ?? (completedProfile as MentorProfile).yearsOfExperience ?? 0,
        };
        completedProfile = { ...completedProfile, ...mentorSpecifics, role: 'mentor' };
      } else if (role === 'mentee') {
        const menteeSpecifics: Partial<MenteeProfile> = {
          learningGoals: (profileData as Partial<MenteeProfile>).learningGoals || (completedProfile as MenteeProfile).learningGoals || '',
          desiredUniversities: (profileData as Partial<MenteeProfile>).desiredUniversities || (completedProfile as MenteeProfile).desiredUniversities || [],
          desiredJobRoles: (profileData as Partial<MenteeProfile>).desiredJobRoles || (completedProfile as MenteeProfile).desiredJobRoles || [],
          desiredCompanies: (profileData as Partial<MenteeProfile>).desiredCompanies || (completedProfile as MenteeProfile).desiredCompanies || [],
        };
        completedProfile = { ...completedProfile, ...menteeSpecifics, role: 'mentee' };
      } else {
        completedProfile.role = null;
      }

      MOCK_USERS[user.email] = completedProfile;
      setUser(completedProfile);
      localStorage.setItem('vedkarn-user', JSON.stringify(completedProfile));
      router.push('/dashboard');
    }
  };

  const confirmBooking = useCallback(async (mentorEmail: string, slotId: string): Promise<void> => {
    if (!user || user.role !== 'mentee') {
      throw new Error("Only mentees can book sessions.");
    }
    const menteeId = user.id;
    const mentorToUpdate = MOCK_USERS[mentorEmail] as MentorProfile | undefined;

    if (mentorToUpdate && mentorToUpdate.availabilitySlots) {
      const slotIndex = mentorToUpdate.availabilitySlots.findIndex(s => s.id === slotId);
      if (slotIndex > -1 && !mentorToUpdate.availabilitySlots[slotIndex].isBooked) {
        const updatedSlots = mentorToUpdate.availabilitySlots.map((slot, index) =>
          index === slotIndex ? { ...slot, isBooked: true, bookedByMenteeId: menteeId } : slot
        );
        (MOCK_USERS[mentorEmail] as MentorProfile).availabilitySlots = updatedSlots;
        setBookingsVersion(v => v + 1); 

        if (user.email === mentorEmail) {
            const updatedCurrentUser = { ...MOCK_USERS[mentorEmail] };
            setUser(updatedCurrentUser);
            localStorage.setItem('vedkarn-user', JSON.stringify(updatedCurrentUser));
        }
        return;
      } else {
        throw new Error("Slot not found or already booked.");
      }
    }
    throw new Error("Mentor not found.");
  }, [user]);


  const getScheduledSessionsForCurrentUser = useCallback(async (): Promise<EnrichedBooking[]> => {
    await new Promise(resolve => setTimeout(resolve, 100)); 
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
  }, [user]);

  const updateMentorAvailability = useCallback(async (mentorId: string, newSlots: AvailabilitySlot[]): Promise<void> => {
    const mentorEmail = Object.keys(MOCK_USERS).find(email => MOCK_USERS[email].id === mentorId);
    if (mentorEmail && MOCK_USERS[mentorEmail] && MOCK_USERS[mentorEmail].role === 'mentor') {
      (MOCK_USERS[mentorEmail] as MentorProfile).availabilitySlots = newSlots;
      
      if (user && user.id === mentorId) {
        const updatedCurrentUser = { ...MOCK_USERS[mentorEmail] };
        setUser(updatedCurrentUser);
        localStorage.setItem('vedkarn-user', JSON.stringify(updatedCurrentUser));
      }
      setBookingsVersion(v => v + 1); // Increment version to trigger UI updates
      return;
    }
    throw new Error("Mentor not found or invalid ID for updating availability.");
  }, [user]);


  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUserProfile,
      completeProfile,
      getScheduledSessionsForCurrentUser,
      confirmBooking,
      updateMentorAvailability,
      bookingsVersion
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
      return `Name: ${m.name}, Bio: ${m.bio || 'N/A'}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${universities}, Companies: ${companies}, Years of Exp: ${m.yearsOfExperience || 0}`;
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