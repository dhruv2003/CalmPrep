'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase/client';
import { UserProfile } from '@/lib/types';
import { getUserProfile } from '@/lib/firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, isDemoMode: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isDemoMode = !isFirebaseConfigured();
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    if (isDemoMode) {
      return;
    }

    const unsubscribe = auth?.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe && unsubscribe();
  }, [isDemoMode]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};
