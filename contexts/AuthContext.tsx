import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types/election';
import { buildApiUrl, API_CONFIG } from '@/config/api';

interface AuthContextType {
  user: User | null;
  login: (
    nik: string
  ) => Promise<
    | 'success'
    | 'user not found'
    | 'invalid account'
    | 'nik not found'
    | 'pemilih not found'
  >;
  registerPemilih: (
    pemilihData: PemilihRegistrationPayload
  ) => Promise<
    'registration successful' | 'email not available' | 'nik not available'
  >;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export interface PemilihRegistrationData {
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

export interface PemilihRegistrationPayload
  extends PemilihRegistrationData {
  file_ktp: {
    uri: string;
    name: string;
    type: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (
    nik: string
  ): Promise<
    | 'success'
    | 'user not found'
    | 'invalid account'
    | 'nik not found'
    | 'pemilih not found'
  > => {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.AUTH.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nik }),
      });

      const data = await response.json();

      if (
        response.status === 404 &&
        data?.message === 'Data pemilih tidak ditemukan.'
      ) {
        return 'pemilih not found';
      }

      if (data.status === 'success') {
        setUser(data.user);
        return 'success';
      } else if (data.status === 'error' && data.message === 'user not found') {
        return 'user not found';
      } else if (data.status === 'error' && data.message === 'nik not found') {
        return 'nik not found';
      } else if (
        data.status === 'error' &&
        data.message === 'invalid account'
      ) {
        return 'invalid account';
      }

      // Fallback for unexpected responses
      return 'user not found';
    } catch (error) {
      console.error('Login error:', error);
      return 'user not found';
    }
  };

  const registerPemilih = async (
    pemilihData: PemilihRegistrationPayload
  ): Promise<
    'registration successful' | 'email not available' | 'nik not available'
  > => {
    try {
      const formData = new FormData();

      Object.entries(pemilihData).forEach(([key, value]) => {
        if (key === 'file_ktp') {
          const fileValue = pemilihData.file_ktp;
          formData.append('file_ktp', {
            uri: fileValue.uri,
            name: fileValue.name,
            type: fileValue.type,
          } as any);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(
        buildApiUrl(API_CONFIG.ROUTES.AUTH.REGISTER_PEMILIH),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.status === 'registration successful') {
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
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        registerPemilih,
        logout,
        updateUser,
      }}
    >
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
