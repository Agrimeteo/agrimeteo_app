import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

type Role = 'farmer' | 'beginner' | 'admin' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  login: (email: string, password: string, role: Role) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null) {
    const maybeAxiosError = error as {
      response?: { data?: { error?: string; message?: string } };
      message?: string;
    };

    return (
      maybeAxiosError.response?.data?.error ||
      maybeAxiosError.response?.data?.message ||
      maybeAxiosError.message ||
      fallback
    );
  }

  return fallback;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [token, setToken] = useState<string | null>(null);

  // Mock persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('agro_user');
    const savedToken = localStorage.getItem('agro_token');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setRoleState(parsed.role);
    }
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const login = async (email: string, password: string, selectedRole: Role) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      
      const user: User = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || 'User',
        email: data.user.email || email,
        role: selectedRole,
      };
      
      setUser(user);
      setRoleState(selectedRole);
      setToken(data.session?.access_token || 'mock-token');
      localStorage.setItem('agro_user', JSON.stringify(user));
      localStorage.setItem('agro_token', data.session?.access_token || 'mock-token');
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(getApiErrorMessage(error, 'Login failed'));
    }
  };

  const register = async (name: string, email: string, password: string, selectedRole: Role) => {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        full_name: name,
        role: selectedRole,
      });
      const { data } = response.data;
      
      const user: User = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || name,
        email: data.user.email || email,
        role: selectedRole,
      };
      
      setUser(user);
      setRoleState(selectedRole);
      setToken(data.session?.access_token || 'mock-token');
      localStorage.setItem('agro_user', JSON.stringify(user));
      localStorage.setItem('agro_token', data.session?.access_token || 'mock-token');
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;

      const updatedUser = { ...currentUser, ...updates };
      localStorage.setItem('agro_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    setRoleState(null);
    setToken(null);
    localStorage.removeItem('agro_user');
    localStorage.removeItem('agro_token');
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem('agro_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      token,
      login, 
      register, 
      updateUser,
      logout, 
      setRole,
      isAuthenticated: !!user 
    }}>
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
