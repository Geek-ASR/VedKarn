"use client";

import type { UserProfile, UserRole } from '@/lib/types';
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
  },
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
  },
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
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith('/auth') && pathname !== '/') {
      router.push('/auth/signin');
    } else if (!loading && user && !user.role && pathname !== '/auth/complete-profile' && !pathname.startsWith('/api')) {
       router.push('/auth/complete-profile');
    }
  }, [user, loading, router, pathname]);

  const login = async (email: string, initialRole?: UserRole) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = MOCK_USERS[email];
    
    if (foundUser) {
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
        name: email.split('@')[0], // Default name
        role: initialRole || null, // Role might be set at signup or later
      };
      setUser(newUser);
      localStorage.setItem('mentorverse-user', JSON.stringify(newUser));
      if (!newUser.role) {
         router.push('/auth/complete-profile');
      } else {
        router.push('/dashboard');
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
      // Mock update to MOCK_USERS for persistence across logins in demo
      if (MOCK_USERS[user.email]) {
        MOCK_USERS[user.email] = { ...MOCK_USERS[user.email], ...updatedUser };
      }
    }
  };
  
  const completeProfile = (profileData: Partial<UserProfile>, role: UserRole) => {
    if (user) {
      const baseProfile = { ...user, ...profileData, role };
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
        completedProfile = baseProfile; // Should not happen if role is mentor/mentee
      }
      
      setUser(completedProfile);
      localStorage.setItem('mentorverse-user', JSON.stringify(completedProfile));
      // Mock update to MOCK_USERS
       if (MOCK_USERS[user.email]) {
         MOCK_USERS[user.email] = completedProfile;
       } else { // New user being completed
         MOCK_USERS[user.email] = completedProfile;
       }
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
    .map(mentor => {
      const m = mentor as MentorProfile;
      return `Name: ${m.name}, Bio: ${m.bio}, Expertise: ${m.expertise?.join(', ') || 'N/A'}, Universities: ${m.universities.map(u => `${u.roleOrDegree} at ${u.institutionName}`).join('; ') || 'N/A'}, Companies: ${m.companies.map(c => `${c.roleOrDegree} at ${c.institutionName}`).join('; ') || 'N/A'}, Years of Exp: ${m.yearsOfExperience || 0}`;
    });
};

// Helper to get full mentor profile by a summarized string (used by AI flow result)
export const getMentorByProfileString = (profileString: string): MentorProfile | undefined => {
  // This is a simplified match based on name. In a real app, you'd use IDs.
  const nameMatch = profileString.match(/Name: (.*?)(?:, Bio:|, Expertise:|$)/);
  if (nameMatch && nameMatch[1]) {
    const name = nameMatch[1].trim();
    return Object.values(MOCK_USERS).find(u => u.role === 'mentor' && u.name === name) as MentorProfile | undefined;
  }
  return undefined;
};