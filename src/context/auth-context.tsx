
"use client";

import type { UserProfile, UserRole, MentorProfile, MenteeProfile } from '@/lib/types'; // Added MentorProfile, MenteeProfile
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Mock user data (replace with actual API calls)
const MOCK_USERS: Record<string, UserProfile> = {
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
    ]
  } as MentorProfile, // Explicitly cast for type safety
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
  } as MenteeProfile, // Explicitly cast for type safety
};

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profileData: Partial<UserProfile>) => void;
  completeProfile: (profileData: Partial<UserProfile>, role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedUser = localStorage.getItem('mentorverse-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation for parsedUser structure
        if (parsedUser && typeof parsedUser.id === 'string' && typeof parsedUser.email === 'string') {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('mentorverse-user'); // Clear invalid item
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('mentorverse-user'); // Clear corrupted item
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return; // Don't run redirection logic while initial loading is true

    const isAuthPage = pathname.startsWith('/auth');
    const isRootPage = pathname === '/';
    const isApiRoute = pathname.startsWith('/api'); // Assuming API routes don't need auth redirection
    
    if (!user && !isAuthPage && !isRootPage && !isApiRoute) {
      router.push('/auth/signin');
    } else if (user && !user.role && pathname !== '/auth/complete-profile' && !isApiRoute) {
       router.push('/auth/complete-profile');
    }
  }, [user, loading, router, pathname]);

  const login = async (email: string, initialRole?: UserRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    let foundUser = MOCK_USERS[email];
    
    if (foundUser) {
      // If user exists in MOCK_USERS, potentially update their role if initialRole is provided
      // This could happen if a pre-defined user tries to "sign up" again with a role
      if (initialRole && foundUser.role !== initialRole) {
        foundUser = { ...foundUser, role: initialRole };
        MOCK_USERS[email] = foundUser; // Update MOCK_USERS
      }
      setUser(foundUser);
      localStorage.setItem('mentorverse-user', JSON.stringify(foundUser));
      if (!foundUser.role) {
        router.push('/auth/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } else {
      // New user
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0] || "New User", // Default name, handle empty email prefix
        role: initialRole || null,
      };
      MOCK_USERS[email] = newUser; // Add new user to MOCK_USERS for this session
      setUser(newUser);
      localStorage.setItem('mentorverse-user', JSON.stringify(newUser));
      if (!newUser.role) { // If role not set during signup (e.g. only email was provided)
         router.push('/auth/complete-profile');
      } else { // Role was set (e.g. during full signup form)
        router.push('/dashboard'); // Or to complete-profile if some fields are still missing based on role, but current logic sends to dashboard
      }
    }
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mentorverse-user');
    router.push('/auth/signin');
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('mentorverse-user', JSON.stringify(updatedUser));
      if (MOCK_USERS[user.email]) {
        MOCK_USERS[user.email] = { ...MOCK_USERS[user.email], ...updatedUser };
      }
    }
  };
  
  const completeProfile = (profileData: Partial<UserProfile>, role: UserRole) => {
    if (user) {
      const baseProfile = { ...user, ...profileData, role }; // User here is from context, should have basic details already
      let completedProfile: UserProfile;

      if (role === 'mentor') {
        completedProfile = {
          ...baseProfile,
          role: 'mentor',
          expertise: (profileData as Partial<MentorProfile>).expertise || [],
          universities: (profileData as Partial<MentorProfile>).universities || [],
          companies: (profileData as Partial<MentorProfile>).companies || [],
          availabilitySlots: (profileData as Partial<MentorProfile>).availabilitySlots || [],
          yearsOfExperience: (profileData as Partial<MentorProfile>).yearsOfExperience || 0,
        } as MentorProfile;
      } else if (role === 'mentee') {
        completedProfile = {
          ...baseProfile,
          role: 'mentee',
          learningGoals: (profileData as Partial<MenteeProfile>).learningGoals || '',
          desiredUniversities: (profileData as Partial<MenteeProfile>).desiredUniversities || [],
          desiredJobRoles: (profileData as Partial<MenteeProfile>).desiredJobRoles || [],
          desiredCompanies: (profileData as Partial<MenteeProfile>).desiredCompanies || [],
        } as MenteeProfile;
      } else {
        // This case should ideally not be reached if role is validated before calling completeProfile
        completedProfile = { ...baseProfile, role: null }; 
      }
      
      setUser(completedProfile);
      localStorage.setItem('mentorverse-user', JSON.stringify(completedProfile));
      // Update MOCK_USERS with the fully completed profile.
      // user.email should exist from the initial login/signup step.
      MOCK_USERS[user.email] = completedProfile; 
      
      router.push('/dashboard');
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserProfile, completeProfile }}>
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

// Helper function to get mock mentor profiles for AI flow
export const getMockMentorProfiles = (): string[] => {
  return Object.values(MOCK_USERS)
    .filter(u => u.role === 'mentor')
    .map(userProfile => { // Renamed to avoid conflict
      const m = userProfile as MentorProfile; // Cast to MentorProfile
      return `Name: ${m.name}, Bio: ${m.bio || 'N/A'}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${m.universities?.map(u => `${u.roleOrDegree} at ${u.institutionName}`).join('; ') || 'N/A'}, Companies: ${m.companies?.map(c => `${c.roleOrDegree} at ${c.institutionName}`).join('; ') || 'N/A'}, Years of Exp: ${m.yearsOfExperience || 0}`;
    });
};

// Helper to get full mentor profile by a summarized string (used by AI flow result)
export const getMentorByProfileString = (profileString: string): MentorProfile | undefined => {
  const nameMatch = profileString.match(/Name: (.*?)(?:, Bio:|, Expertise:|$)/);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    const foundUser = Object.values(MOCK_USERS).find(u => u.role === 'mentor' && u.name === name);
    return foundUser ? foundUser as MentorProfile : undefined;
  }
  return undefined;
};


    