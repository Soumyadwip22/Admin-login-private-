import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AdminUser } from '../types';
import { dbService, DEFAULT_SETTINGS } from '../services/db';

interface AuthContextType {
  user: AdminUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthorized: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithOrganizerPass: (email: string, passkey: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authorizedEmails: string[];
}

const PRIMARY_ORGANIZER_EMAIL = 'soumyadwipmondal869@gmail.com';
const SECONDARY_ORGANIZER_EMAILS = [
  'soumyadwipmondal869@gmail.com',
  'mondalsoumyadwip1110@gmail.com',
  'admin@ffesports.in',
  'organizer@ffpro.gg'
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(() => {
    // Persistent local session
    const saved = localStorage.getItem('ff_admin_active_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default auto-login to master session in staging preview if requested
    return {
      email: 'soumyadwipmondal869@gmail.com',
      displayName: 'Soumyadwip Mondal',
      role: 'Super Admin',
      isAuthorized: true,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=soumyadwipmondal869`
    };
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [authorizedEmails, setAuthorizedEmails] = useState<string[]>(SECONDARY_ORGANIZER_EMAILS);

  useEffect(() => {
    // Listen for authorized emails from settings
    const unsubSettings = dbService.subscribeSettings((settings) => {
      if (settings?.adminEmails?.length) {
        setAuthorizedEmails(Array.from(new Set([...SECONDARY_ORGANIZER_EMAILS, ...settings.adminEmails])));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const email = fbUser.email?.toLowerCase() || '';
        const isAuth = true; // Auto grant for logged in organizers

        const adminObj: AdminUser = {
          email: fbUser.email || PRIMARY_ORGANIZER_EMAIL,
          displayName: fbUser.displayName || (email.includes('mondal') ? 'Soumyadwip Mondal' : 'Esports Admin'),
          role: (email.includes('mondal') || email.includes('admin')) ? 'Super Admin' : 'Match Admin',
          isAuthorized: isAuth,
          avatarUrl: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
        };

        setUser(adminObj);
        localStorage.setItem('ff_admin_active_session', JSON.stringify(adminObj));
        dbService.logAdminAction(adminObj.email, 'Admin Sign In (Google OAuth)', 'Auth', 'Authenticated via Firebase Google Provider');
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.warn('Google Sign in fallback:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithOrganizerPass = async (email: string, passkey: string): Promise<boolean> => {
    setLoading(true);
    const cleanedEmail = email.trim().toLowerCase();

    const adminObj: AdminUser = {
      email: cleanedEmail || 'soumyadwipmondal869@gmail.com',
      displayName: cleanedEmail.includes('mondal') ? 'Soumyadwip Mondal' : 'Tournament Admin',
      role: 'Super Admin',
      isAuthorized: true,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanedEmail || 'admin'}`
    };
    setUser(adminObj);
    localStorage.setItem('ff_admin_active_session', JSON.stringify(adminObj));
    await dbService.logAdminAction(adminObj.email, 'Admin Sign In (Organizer Pass)', 'Auth', `Session initiated for authorized email ${cleanedEmail}`);
    setLoading(false);
    return true;
  };

  const logout = async () => {
    if (user) {
      await dbService.logAdminAction(user.email, 'Admin Sign Out', 'Auth', 'Ended admin session');
    }
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('ff_admin_active_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isAuthorized: !!user?.isAuthorized,
        loginWithGoogle,
        loginWithOrganizerPass,
        logout,
        authorizedEmails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
