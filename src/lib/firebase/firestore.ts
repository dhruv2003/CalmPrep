import { collection, doc, setDoc, getDoc, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './client';
import { UserProfile, CheckIn, GuardianAlert } from '../types';

export const saveUserProfile = async (userId: string, profileData: Partial<UserProfile>) => {
  if (!isFirebaseConfigured() || !db) return;
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...profileData,
    createdAt: profileData.createdAt || Timestamp.now().toDate().toISOString()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isFirebaseConfigured() || !db) return null;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

export const saveCheckIn = async (userId: string, checkIn: CheckIn) => {
  if (!isFirebaseConfigured() || !db) return;
  const checkInsRef = collection(db, 'users', userId, 'checkins');
  await addDoc(checkInsRef, {
    ...checkIn,
    createdAt: Timestamp.now().toDate().toISOString()
  });
};

export const getCheckIns = async (userId: string): Promise<CheckIn[]> => {
  if (!isFirebaseConfigured() || !db) return [];
  const checkInsRef = collection(db, 'users', userId, 'checkins');
  const q = query(checkInsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CheckIn));
};

export const createGuardianAlert = async (alert: Omit<GuardianAlert, 'id'>) => {
  if (!isFirebaseConfigured() || !db) return;
  const alertsRef = collection(db, 'guardianAlerts');
  await addDoc(alertsRef, alert);
};
