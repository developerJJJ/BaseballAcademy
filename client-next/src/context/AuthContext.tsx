"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Role = 'ATHLETE' | 'COACH' | 'PARENT' | 'ADMIN';

interface User {
  id: string;
  name: string;
  role: Role;
  academyId: string;
}

interface AuthContextType {
  user: User | null;
  login: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Mock users based on our database seed
  const mockUsers: Record<Role, User> = {
    ATHLETE: { id: '6', name: '김민수', role: 'ATHLETE', academyId: '1' },
    COACH: { id: '5', name: '박코치', role: 'COACH', academyId: '1' },
    PARENT: { id: '9', name: '김학부모', role: 'PARENT', academyId: '1' },
    ADMIN: { id: '8', name: '제임스', role: 'ADMIN', academyId: '1' },
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('academy_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (role: Role) => {
    const newUser = mockUsers[role];
    setUser(newUser);
    localStorage.setItem('academy_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('academy_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
