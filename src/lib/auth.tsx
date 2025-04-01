
import { useState, useEffect, createContext, useContext } from 'react';

type User = {
  username: string;
  provider?: string;
  email?: string;
  photoURL?: string;
};

type AuthContextType = {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
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

// Mock function for Google authentication
const mockGoogleAuth = async (): Promise<User> => {
  // Simulate Google auth delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a mock Google user
  return {
    username: 'google_user',
    provider: 'google',
    email: 'user@gmail.com',
    photoURL: 'https://lh3.googleusercontent.com/a/default-user'
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>({ username: 'demo' });
  const [isLoading, setIsLoading] = useState(false);

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // For demo purposes, allow any login
      const user = { 
        username: username || 'demo',
        provider: 'local'
      };
      setUser(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real app, this would integrate with Google OAuth
      const googleUser = await mockGoogleAuth();
      setUser(googleUser);
      localStorage.setItem('auth_user', JSON.stringify(googleUser));
      return true;
    } catch (error) {
      console.error('Google login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Modified to actually check for authentication
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      Please login to access this page.
    </div>;
  }
  
  return <>{children}</>;
};
