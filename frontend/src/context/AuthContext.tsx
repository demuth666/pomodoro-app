import React, { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { type User } from '../types';

// Create a mechanism to access logout outside of React context
let logoutHandler = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

export const logout = () => logoutHandler();

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  login: () => void;
  logout: () => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openRegisterModal: () => void;
  closeRegisterModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        return !! token;
    }
    return false;
  });

  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile();
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (token) {
          fetchProfile();
      } else {
          setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Initial check
    if (isAuthenticated) {
        fetchProfile();
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    localStorage.removeItem('guestTasks');
    localStorage.removeItem('currentTask');
    localStorage.removeItem('pomodoro_settings')
    fetchProfile();
  };

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('currentTask')
    setIsAuthenticated(false);
    setUser(null);
  };

  useEffect(() => {
    logoutHandler = logout;
    return () => {
      logoutHandler = () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      };
    };
  }, []);

  const openLoginModal = () => {
    setShowLoginModal(true);
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
  };

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openRegisterModal = () => {
    setShowRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        showLoginModal,
        showRegisterModal,
        login,
        logout,
        openLoginModal,
        closeLoginModal,
        openRegisterModal,
        closeRegisterModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
