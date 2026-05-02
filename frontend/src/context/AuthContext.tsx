import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  name: string;
  email: string;
  username?: string;
  role: 'admin' | 'agency' | 'super_admin';
  initials: string;
  agencyName?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: 'admin' | 'agency' | 'super_admin') => void;
  updateAvatar: (url: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is in localStorage (for simulation)
    const savedUser = localStorage.getItem('fp_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (role: 'admin' | 'agency' | 'super_admin') => {
    let mockUser: User;
    if (role === 'agency') {
      mockUser = {
        name: 'Abenezer Kassa',
        email: 'abenezer.manager@abyssinia.com',
        username: 'abenezer_k',
        role: 'agency',
        initials: 'AK',
        agencyName: 'Abyssinia Security Services'
      };
    } else if (role === 'super_admin') {
      mockUser = {
        name: 'Super Admin',
        email: 'super.admin@fedpolice.gov.et',
        username: 'super_admin',
        role: 'super_admin',
        initials: 'SA'
      };
    } else {
      mockUser = {
        name: 'Admin User',
        email: 'admin.verify@fedpolice.gov.et',
        username: 'admin_verify',
        role: 'admin',
        initials: 'AU'
      };
    }
    setUser(mockUser);
    localStorage.setItem('fp_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fp_user');
  };

  const updateAvatar = (url: string) => {
    if (user) {
      const updatedUser = { ...user, avatar: url };
      setUser(updatedUser);
      localStorage.setItem('fp_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, updateAvatar, logout }}>
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
