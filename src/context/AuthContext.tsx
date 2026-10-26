import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, testConnection } from '../firebase/config';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile;
  role: UserRole;
  isLoading: boolean;
  isDemoMode: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
  // Permissions derived from RBAC
  canAddTransaction: boolean;
  canEditTransaction: boolean;
  canDeleteTransaction: boolean;
  canManageTeam: boolean;
  canEditGoals: boolean;
  canExportReports: boolean;
  isExecutive: boolean;
}

const DEFAULT_OWNER_PROFILE: UserProfile = {
  userId: 'default-owner',
  email: '786zahidhossen786@gmail.com',
  displayName: 'Zahid Hossen',
  role: 'founder',
  businessName: 'Vantage Enterprises',
  createdAt: '2026-01-01T00:00:00Z',
};

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  founder: {
    userId: 'founder-zahid',
    email: '786zahidhossen786@gmail.com',
    displayName: 'Zahid Hossen (Founder)',
    role: 'founder',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-01-01T00:00:00Z',
  },
  'co-founder': {
    userId: 'cofounder-tariq',
    email: 'tariq.cofounder@vantagecorp.io',
    displayName: 'Tariq Rahman (Co-Founder)',
    role: 'co-founder',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-01-15T00:00:00Z',
  },
  ceo: {
    userId: 'ceo-elena',
    email: 'elena.ceo@vantagecorp.io',
    displayName: 'Elena Rostova (CEO)',
    role: 'ceo',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-02-01T00:00:00Z',
  },
  director: {
    userId: 'director-robert',
    email: 'robert.director@vantagecorp.io',
    displayName: 'Robert Hayes (Managing Director)',
    role: 'director',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-02-15T00:00:00Z',
  },
  manager: {
    userId: 'manager-alex',
    email: 'alex.finance@vantagecorp.io',
    displayName: 'Alex Vance (Finance Manager)',
    role: 'manager',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-03-15T00:00:00Z',
  },
  salesman: {
    userId: 'salesman-bilal',
    email: 'bilal.sales@vantagecorp.io',
    displayName: 'Bilal Karim (Salesman)',
    role: 'salesman',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-04-01T00:00:00Z',
  },
  worker: {
    userId: 'worker-david',
    email: 'david.worker@vantagecorp.io',
    displayName: 'David Miller (Worker)',
    role: 'worker',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-04-15T00:00:00Z',
  },
  owner: {
    userId: 'default-owner',
    email: '786zahidhossen786@gmail.com',
    displayName: 'Zahid Hossen (Owner)',
    role: 'owner',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-01-01T00:00:00Z',
  },
  analyst: {
    userId: 'analyst-sarah',
    email: 'sarah.analyst@vantagecorp.io',
    displayName: 'Sarah Chen (Financial Analyst)',
    role: 'analyst',
    businessName: 'Vantage Enterprises',
    createdAt: '2026-05-10T00:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_OWNER_PROFILE);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    testConnection();

    // Check saved demo role
    const savedRole = localStorage.getItem('vantage_demo_role') as UserRole;
    if (savedRole && DEMO_PROFILES[savedRole]) {
      setProfile(DEMO_PROFILES[savedRole]);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoMode(false);
        const isOwnerEmail = user.email === '786zahidhossen786@gmail.com';
        setProfile({
          userId: user.uid,
          email: user.email || 'user@vantagecorp.io',
          displayName: user.displayName || 'Authorized Member',
          role: isOwnerEmail ? 'founder' : 'manager',
          businessName: 'Vantage Enterprises',
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        });
      } else {
        setCurrentUser(null);
        setIsDemoMode(true);
        const currentSavedRole = (localStorage.getItem('vantage_demo_role') as UserRole) || 'founder';
        setProfile(DEMO_PROFILES[currentSavedRole] || DEMO_PROFILES.founder);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.warn('Firebase popup sign-in encountered an issue or was closed:', error);
    }
  };

  const signOut = async () => {
    try {
      if (currentUser) {
        await fbSignOut(auth);
      }
      setIsDemoMode(true);
      setProfile(DEMO_PROFILES.founder);
      localStorage.removeItem('vantage_demo_role');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const switchDemoRole = (newRole: UserRole) => {
    localStorage.setItem('vantage_demo_role', newRole);
    setProfile(DEMO_PROFILES[newRole]);
  };

  const permissions = useMemo(() => {
    const r = profile.role;
    const isExecutive = r === 'founder' || r === 'co-founder' || r === 'ceo' || r === 'owner';
    const isLeadership = isExecutive || r === 'director' || r === 'manager';

    return {
      isExecutive,
      canAddTransaction: isLeadership || r === 'salesman' || r === 'worker',
      canEditTransaction: isLeadership,
      canDeleteTransaction: isExecutive,
      canManageTeam: isExecutive,
      canEditGoals: isExecutive,
      canExportReports: true,
    };
  }, [profile.role]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        role: profile.role,
        isLoading,
        isDemoMode,
        signInWithGoogle,
        signOut,
        switchDemoRole,
        ...permissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
