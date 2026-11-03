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
  isAuthenticated: boolean;
  isLocked: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithRole: (newRole: UserRole) => void;
  lockSession: () => void;
  unlockSession: () => void;
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
  businessName: 'DCC TRADING CO',
  createdAt: '2026-01-01T00:00:00Z',
};

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  founder: {
    userId: 'founder-zahid',
    email: '786zahidhossen786@gmail.com',
    displayName: 'Zahid Hossen (Founder)',
    role: 'founder',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-01-01T00:00:00Z',
  },
  'co-founder': {
    userId: 'cofounder-tariq',
    email: 'tariq.cofounder@sika-gcc.com',
    displayName: 'Tariq Rahman (Co-Founder)',
    role: 'co-founder',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-01-15T00:00:00Z',
  },
  ceo: {
    userId: 'ceo-amina',
    email: 'amina.ceo@sika-gcc.com',
    displayName: 'Amina Al-Mansoor (CEO)',
    role: 'ceo',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-02-01T00:00:00Z',
  },
  director: {
    userId: 'director-khalid',
    email: 'khalid.director@sika-gcc.com',
    displayName: 'Eng. Khalid Al-Sayed (Director)',
    role: 'director',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-02-15T00:00:00Z',
  },
  manager: {
    userId: 'manager-hassan',
    email: 'hassan.finance@sika-gcc.com',
    displayName: 'Hassan Reza (Operations & Finance)',
    role: 'manager',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-03-15T00:00:00Z',
  },
  salesman: {
    userId: 'salesman-bilal',
    email: 'bilal.sales@sika-gcc.com',
    displayName: 'Bilal Karim (Salesman)',
    role: 'salesman',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-04-01T00:00:00Z',
  },
  worker: {
    userId: 'worker-faisal',
    email: 'faisal.worker@sika-gcc.com',
    displayName: 'Faisal Ahmed (Worker)',
    role: 'worker',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-04-15T00:00:00Z',
  },
  owner: {
    userId: 'default-owner',
    email: '786zahidhossen786@gmail.com',
    displayName: 'Zahid Hossen (Executive Owner)',
    role: 'owner',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-01-01T00:00:00Z',
  },
  analyst: {
    userId: 'analyst-audit',
    email: 'audit@sika-gcc.com',
    displayName: 'Financial Auditor (Analyst)',
    role: 'analyst',
    businessName: 'DCC TRADING CO',
    createdAt: '2026-05-10T00:00:00Z',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_OWNER_PROFILE);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('sika_auth_session') === 'authenticated';
  });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    testConnection();

    // Check saved demo role and initialize SIKA GCC profile
    if (localStorage.getItem('sika_gcc_auth_v2') !== 'true') {
      localStorage.setItem('sika_gcc_auth_v2', 'true');
      localStorage.setItem('vantage_demo_role', 'founder');
      setProfile(DEMO_PROFILES.founder);
    } else {
      const savedRole = localStorage.getItem('vantage_demo_role') as UserRole;
      if (savedRole && DEMO_PROFILES[savedRole]) {
        setProfile(DEMO_PROFILES[savedRole]);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoMode(false);
        setIsAuthenticated(true);
        localStorage.setItem('sika_auth_session', 'authenticated');
        const isOwnerEmail = user.email === '786zahidhossen786@gmail.com';
        setProfile({
          userId: user.uid,
          email: user.email || 'user@sika-gcc.com',
          displayName: user.displayName || 'Authorized Member',
          role: isOwnerEmail ? 'founder' : 'manager',
          businessName: 'DCC TRADING CO',
          photoURL: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
        });
      } else {
        setCurrentUser(null);
        const sessionActive = localStorage.getItem('sika_auth_session') === 'authenticated';
        setIsAuthenticated(sessionActive);
        setIsDemoMode(!sessionActive);
        const currentSavedRole = (localStorage.getItem('vantage_demo_role') as UserRole) || 'founder';
        setProfile(DEMO_PROFILES[currentSavedRole] || DEMO_PROFILES.founder);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setIsAuthenticated(true);
      setIsLocked(false);
      localStorage.setItem('sika_auth_session', 'authenticated');
      closeLoginModal();
      return { success: true };
    } catch (error) {
      console.warn('Firebase popup sign-in encountered an issue or was closed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google sign-in popup closed or cancelled.',
      };
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !pass) {
      return { success: false, error: 'Please enter both your work email and password.' };
    }

    if (pass.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check against known company profiles
    let matchingRole: UserRole = 'salesman';
    if (cleanEmail.includes('zahid') || cleanEmail.includes('786zahidhossen786')) {
      matchingRole = 'founder';
    } else if (cleanEmail.includes('tariq') || cleanEmail.includes('cofounder')) {
      matchingRole = 'co-founder';
    } else if (cleanEmail.includes('amina') || cleanEmail.includes('ceo')) {
      matchingRole = 'ceo';
    } else if (cleanEmail.includes('khalid') || cleanEmail.includes('director')) {
      matchingRole = 'director';
    } else if (cleanEmail.includes('hassan') || cleanEmail.includes('finance') || cleanEmail.includes('manager')) {
      matchingRole = 'manager';
    } else if (cleanEmail.includes('bilal') || cleanEmail.includes('sales')) {
      matchingRole = 'salesman';
    } else if (cleanEmail.includes('faisal') || cleanEmail.includes('worker')) {
      matchingRole = 'worker';
    }

    const selectedProfile = DEMO_PROFILES[matchingRole];
    setProfile({
      ...selectedProfile,
      email: cleanEmail,
    });
    localStorage.setItem('vantage_demo_role', matchingRole);
    localStorage.setItem('sika_auth_session', 'authenticated');
    setIsAuthenticated(true);
    setIsDemoMode(false);
    setIsLocked(false);
    closeLoginModal();

    return { success: true };
  };

  const loginWithRole = (newRole: UserRole) => {
    localStorage.setItem('vantage_demo_role', newRole);
    localStorage.setItem('sika_auth_session', 'authenticated');
    setProfile(DEMO_PROFILES[newRole]);
    setIsAuthenticated(true);
    setIsDemoMode(false);
    setIsLocked(false);
    closeLoginModal();
  };

  const lockSession = () => {
    setIsLocked(true);
  };

  const unlockSession = () => {
    setIsLocked(false);
  };

  const signOut = async () => {
    try {
      if (currentUser) {
        await fbSignOut(auth);
      }
      setIsAuthenticated(false);
      setIsDemoMode(true);
      setIsLocked(false);
      setProfile(DEMO_PROFILES.founder);
      localStorage.removeItem('sika_auth_session');
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
        isAuthenticated,
        isLocked,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        signInWithGoogle,
        loginWithEmail,
        loginWithRole,
        lockSession,
        unlockSession,
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
