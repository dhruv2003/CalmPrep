import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './client';

export const signInWithGoogle = async (): Promise<FirebaseUser | null> => {
  if (!isFirebaseConfigured() || !auth) {
    console.warn("Firebase is not configured. Returning mock user for demo mode.");
    return {
      uid: 'demo-user-123',
      displayName: 'Demo Student',
      email: 'demo@student.com',
    } as FirebaseUser;
  }

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  if (!isFirebaseConfigured() || !auth) {
    return;
  }
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
