import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { users } from '@/lib/mockData';

interface AuthContextValue {
  user: User | null;
  pendingUser: User | null;
  isAuthenticating: boolean;
  step: 'credentials' | 'otp' | 'authenticated';
  error: string | null;
  verifyCredentials: (email: string, password: string) => boolean;
  verifyOtp: (otp: string) => boolean;
  logout: () => void;
  reset: () => void;
  canEdit: () => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [step, setStep] = useState<'credentials' | 'otp' | 'authenticated'>('credentials');
  const [error, setError] = useState<string | null>(null);

  const verifyCredentials = (email: string, _password: string) => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) {
      setError('Invalid credentials. Please contact your department administrator.');
      return false;
    }
    setError(null);
    setPendingUser(found);
    setStep('otp');
    return true;
  };

  const verifyOtp = (otp: string) => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter the 6-digit verification code.');
      return false;
    }
    if (otp !== '428913') {
      setError('Incorrect verification code. Please try again.');
      return false;
    }
    if (!pendingUser) return false;
    setUser(pendingUser);
    setPendingUser(null);
    setError(null);
    setStep('authenticated');
    return true;
  };

  const logout = () => {
    setUser(null);
    setPendingUser(null);
    setStep('credentials');
    setError(null);
  };

  const reset = () => {
    setPendingUser(null);
    setStep('credentials');
    setError(null);
  };

  const canEdit = () => user?.role === 'admin' || user?.role === 'analyst';

  return (
    <AuthContext.Provider
      value={{
        user,
        pendingUser,
        isAuthenticating: step === 'authenticated',
        step,
        error,
        verifyCredentials,
        verifyOtp,
        logout,
        reset,
        canEdit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  analyst: 'Policy Analyst',
  viewer: 'Observer',
};
