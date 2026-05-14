'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else {
      setUser(session?.user || null);
      setLoading(false);
    }
  }, [session, status]);

  const login = async (email, password) => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      callbackUrl: '/admin/dashboard',
    });

    if (result.ok) {
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Login failed' };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    setUser(null);
  };

  const checkAuth = async () => {
    // Session is automatically managed by next-auth
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}