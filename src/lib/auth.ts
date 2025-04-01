
import { useState, useEffect, createContext, useContext } from 'react';

type User = {
  username: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Always set a default user for now to bypass authentication
  const [user, setUser] = useState<User | null>({ username: 'demo' });
  const [isLoading, setIsLoading] = useState(false);

  // No need to check localStorage since we're bypassing auth
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Always return success for now
    const user = { username: username || 'demo' };
    setUser(user);
    return true;
  };

  const logout = () => {
    // For now, just reset to the demo user instead of null
    setUser({ username: 'demo' });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Modified to always allow access
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Always render children, bypassing the protection
  return <>{children}</>;
};
