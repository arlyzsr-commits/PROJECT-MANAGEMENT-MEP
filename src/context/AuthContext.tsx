import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  updatePassword as firebaseUpdatePassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { handleFirestoreError, OperationType } from '../lib/errorHandling';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, role?: UserRole) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  setSimulatedRole: (role: UserRole | null) => void;
  updateUserRole: (uid: string, newRole: UserRole) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  isManager: boolean;
  isSupervisor: boolean;
  isViewer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          
          const isSuperAdminEmail = user.email === 'arlyz.s.r@gmail.com';

          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            // Always ensure super admin email has MANAGER role
            if (isSuperAdminEmail && data.role !== 'MANAGER') {
              await updateDoc(userDocRef, { role: 'MANAGER' });
              data.role = 'MANAGER';
            }
            setUserProfile(data);
          } else {
            // First time user registration
            const defaultRole: UserRole = isSuperAdminEmail ? 'MANAGER' : 'MANAGER'; // Default first users to Manager for ease of management
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'user@balakresort.com',
              displayName: user.displayName || user.email?.split('@')[0] || 'MEP Engineer',
              role: defaultRole,
              company: 'PT. PANTAI BESOR REKREASI BAHARI',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Fallback profile if offline
          setUserProfile({
            uid: user.uid,
            email: user.email || 'offline@balakresort.com',
            displayName: user.displayName || 'MEP Engineer',
            role: 'MANAGER',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const effectiveRole: UserRole = simulatedRole || userProfile?.role || 'MANAGER';

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, role: UserRole = 'SUPERVISOR') => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await firebaseUpdateProfile(cred.user, { displayName });
      const userDocRef = doc(db, 'users', cred.user.uid);
      const isSuper = email === 'arlyz.s.r@gmail.com';
      const profile: UserProfile = {
        uid: cred.user.uid,
        email,
        displayName,
        role: isSuper ? 'MANAGER' : role,
        company: 'PT. PANTAI BESOR REKREASI BAHARI',
        createdAt: new Date().toISOString(),
      };
      await setDoc(userDocRef, profile);
      setUserProfile(profile);
    }
  };

  const signInGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOutUser = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
    setSimulatedRole(null);
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    const path = `users/${uid}`;
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      if (currentUser?.uid === uid && userProfile) {
        setUserProfile({ ...userProfile, role: newRole });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error('No user logged in');
    await firebaseUpdatePassword(currentUser, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: effectiveRole,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInGoogle,
        signOutUser,
        setSimulatedRole,
        updateUserRole,
        changePassword,
        isManager: effectiveRole === 'MANAGER',
        isSupervisor: effectiveRole === 'SUPERVISOR',
        isViewer: effectiveRole === 'VIEWER',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
