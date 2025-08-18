import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { Vote, Users, Shield } from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthIndex() {
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user]);

  return (
    <ImageBackground
      source={{
        uri: 'https://images.pexels.com/photos/3970396/pexels-photo-3970396.jpeg',
      }}
      style={styles.background}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Vote size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>PILKADES</Text>
            <Text style={styles.subtitle}>
              Sistem Pemilihan Kepala Desa Digital
            </Text>
          </View>

          <View style={styles.features}>
            <View style={styles.feature}>
              <Users size={24} color="#DC2626" />
              <Text style={styles.featureText}>Kenali Calon</Text>
            </View>
            <View style={styles.feature}>
              <Shield size={24} color="#DC2626" />
              <Text style={styles.featureText}>Voting Aman</Text>
            </View>
            <View style={styles.feature}>
              <Vote size={24} color="#DC2626" />
              <Text style={styles.featureText}>Hasil Real-time</Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <CustomButton
              title="Masuk"
              onPress={() => router.push('/auth/login')}
              style={styles.loginButton}
            />
            <CustomButton
              title="Daftar Akun"
              onPress={() => router.push('/auth/register')}
              variant="secondary"
              style={styles.registerButton}
            />
          </View>

          <Text style={styles.footer}>
            Suara Anda Menentukan Masa Depan Desa
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 48,
  },
  feature: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  featureText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  buttons: {
    gap: 16,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#DC2626',
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
