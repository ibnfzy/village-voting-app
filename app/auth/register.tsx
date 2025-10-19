import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { router } from 'expo-router';
import { User, Lock } from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/contexts/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerUser } = useAuth();

  const handleRegisterUser = async () => {
    setError('');

    if (!username) {
      setError('Mohon isi username');
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser(username);
      if (result === 'user created') {
        router.push('/auth/register-pemilih');
      } else if (result === 'username not available') {
        setError('Username sudah digunakan');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <CustomButton
          title="←"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.backButton}
          textStyle={styles.backButtonText}
        />
        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Langkah 1: Masukkan username Anda</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <CustomButton
          title={loading ? 'Memproses...' : 'Lanjutkan'}
          onPress={handleRegisterUser}
          disabled={loading}
          style={styles.registerButton}
        />

        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <Text
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            Masuk di sini
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 20,
    paddingVertical: 0,
  },
  backButtonText: {
    fontSize: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  registerButton: {
    marginTop: 12,
  },
  infoBox: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
});
