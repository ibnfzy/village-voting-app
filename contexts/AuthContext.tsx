import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/election';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<'success' | 'user not found' | 'password wrong'>;
  registerUser: (username: string) => Promise<'user created' | 'username not available'>;
  registerPemilih: (pemilihData: PemilihRegistrationData) => Promise<'registration successful' | 'email not available' | 'nik not available'>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  tempUserId: number | null;
}

export interface PemilihRegistrationData {
  user_id: number;
  nik: string;
  name: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  email: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tempUserId, setTempUserId] = useState<number | null>(null);

  const login = async (username: string, password: string): Promise<'success' | 'user not found' | 'password wrong'> => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setUser(data.user);
        return 'success';
      } else if (data.status === 'user not found') {
        return 'user not found';
      } else if (data.status === 'password wrong') {
        return 'password wrong';
      }

      // Fallback for unexpected responses
      return 'user not found';
    } catch (error) {
      console.error('Login error:', error);
      return 'user not found';
    }
  };

  const registerUser = async (username: string): Promise<'user created' | 'username not available'> => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.AUTH.REGISTER_USER), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.status === 'user created') {
        setTempUserId(data.user_id);
        return 'user created';
      } else if (data.status === 'username not available') {
        return 'username not available';
      }

      // Fallback for unexpected responses
      return 'username not available';
    } catch (error) {
      console.error('User registration error:', error);
      return 'username not available';
    }
  };

  const registerPemilih = async (pemilihData: PemilihRegistrationData): Promise<'registration successful' | 'email not available' | 'nik not available'> => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.AUTH.REGISTER_PEMILIH), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pemilihData),
      });

      const data = await response.json();

      if (data.status === 'registration successful') {
        setUser(data.user);
        setTempUserId(null);
        return 'registration successful';
      } else if (data.status === 'email not available') {
        return 'email not available';
      } else if (data.status === 'nik not available') {
        return 'nik not available';
      }

      // Fallback for unexpected responses
      return 'email not available';
    } catch (error) {
      console.error('Pemilih registration error:', error);
      return 'email not available';
    }
  };

  const logout = () => {
    setUser(null);
    setTempUserId(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, registerUser, registerPemilih, logout, updateUser, tempUserId }}>
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