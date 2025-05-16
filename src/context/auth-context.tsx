
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
    const storedUser = localStorage.getItem('vedkarn-user'); // Updated localStorage key
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Basic validation for parsedUser structure
        if (parsedUser && typeof parsedUser.id === 'string' && typeof parsedUser.email === 'string') {
          setUser(parsedUser);
        } else {
          localStorage.removeItem('vedkarn-user'); // Clear invalid item
        }
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem('vedkarn-user'); // Clear corrupted item
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
      localStorage.setItem('vedkarn-user', JSON.stringify(foundUser)); // Updated localStorage key
      if (!foundUser.role) {
        router.push('/auth/complete-profile');
      } else {
        router.push('/dashboard');
      }
    } else {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0] || "New User",
        role: initialRole || null, 
      };
      MOCK_USERS[email] = newUser; 
      setUser(newUser);
      localStorage.setItem('vedkarn-user', JSON.stringify(newUser)); // Updated localStorage key
      if (!newUser.role || (initialRole && !profileIsConsideredComplete(newUser, initialRole))) { 
         router.push('/auth/complete-profile');
      } else { 
        router.push('/dashboard'); 
      }
    }
    setLoading(false);
  };
  
  const profileIsConsideredComplete = (profile: UserProfile, role: UserRole): boolean => {
    if (!role) return false; 
    if (role === 'mentor' && !(profile as MentorProfile).expertise?.length) return false;
    if (role === 'mentee' && !(profile as MenteeProfile).learningGoals) return false;
    return true; 
  }

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vedkarn-user'); // Updated localStorage key
    router.push('/auth/signin');
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...profileData };
      setUser(updatedUser);
      localStorage.setItem('vedkarn-user', JSON.stringify(updatedUser)); // Updated localStorage key
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
        completedProfile = { ...baseProfile, role: null }; 
      }
      
      setUser(completedProfile);
      localStorage.setItem('vedkarn-user', JSON.stringify(completedProfile)); // Updated localStorage key
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

    
