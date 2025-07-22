import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Mohon isi semua field');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);
      if (result === 'success') {
        router.replace('/(tabs)');
      } else if (result === 'user not found') {
        Alert.alert('Error', 'Pengguna tidak ditemukan');
      } else if (result === 'password wrong') {
        Alert.alert('Error', 'Password salah');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat login');
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
        <Text style={styles.title}>Masuk</Text>
        <Text style={styles.subtitle}>Masuk ke akun Anda untuk mulai voting</Text>
      </View>

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

        <View style={styles.inputContainer}>
          <Lock size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <CustomButton
          title={loading ? "Masuk..." : "Masuk"}
          onPress={handleLogin}
          disabled={loading}
          style={styles.loginButton}
        />

        <View style={styles.registerPrompt}>
          <Text style={styles.registerText}>Belum punya akun? </Text>
          <Text 
            style={styles.registerLink}
            onPress={() => router.push('/auth/register')}
          >
            Daftar di sini
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
    marginBottom: 40,
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
  form: {
    gap: 20,
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
  loginButton: {
    marginTop: 12,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
});