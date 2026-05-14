import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  emp_id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'finance' | 'hr' | 'manager';
}

interface AuthContextType {
  user: User | null;
  login: (email_address: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook para magamit yung AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  
  return context;
};

// Base URL ng API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? (JSON.parse(saved) as User) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email_address: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email_address, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        setUser(data.user as User);
        return { success: true };
      }

      return { success: false, error: data.error || 'Invalid credentials' };
    } catch {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};