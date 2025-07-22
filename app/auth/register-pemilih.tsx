import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { User, Mail, CreditCard, MapPin, Calendar, Users } from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth, PemilihRegistrationData } from '@/contexts/AuthContext';

export default function RegisterPemilih() {
  const { registerPemilih, tempUserId } = useAuth();
  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!tempUserId) {
      router.replace('/auth/register');
    }
  }, [tempUserId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegisterPemilih = async () => {
    setError('');
    
    // Validate required fields
    if (!formData.nik || !formData.name || !formData.email) {
      setError('NIK, Nama, dan Email wajib diisi');
      return;
    }

    if (formData.nik.length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }

    if (!tempUserId) {
      setError('Session expired, silakan mulai dari awal');
      router.replace('/auth/register');
      return;
    }

    setLoading(true);
    try {
      const pemilihData: PemilihRegistrationData = {
        user_id: tempUserId,
        ...formData,
        jenis_kelamin: formData.jenis_kelamin as 'L' | 'P' | undefined,
      };

      const result = await registerPemilih(pemilihData);
      if (result === 'registration successful') {
        Alert.alert(
          'Registrasi Berhasil',
          'Akun Anda telah berhasil dibuat!',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else if (result === 'email not available') {
        setError('Email sudah digunakan');
      } else if (result === 'nik not available') {
        setError('NIK sudah terdaftar');
      }
    } catch (error) {
      setError('Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  if (!tempUserId) {
    return null;
  }

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
        <Text style={styles.title}>Data Pemilih</Text>
        <Text style={styles.subtitle}>Langkah 2: Lengkapi data KTP Anda</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Setelah registrasi selesai, Anda akan menerima password dari panitia pemilihan untuk dapat login dan voting
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Data Pribadi</Text>
        
        <View style={styles.inputContainer}>
          <CreditCard size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="NIK (16 digit) *"
            value={formData.nik}
            onChangeText={(value) => handleInputChange('nik', value)}
            keyboardType="numeric"
            maxLength={16}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <User size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Nama Lengkap *"
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tempat Lahir"
            value={formData.tempat_lahir}
            onChangeText={(value) => handleInputChange('tempat_lahir', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <Calendar size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Tanggal Lahir (YYYY-MM-DD)"
            value={formData.tanggal_lahir}
            onChangeText={(value) => handleInputChange('tanggal_lahir', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <Users size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Jenis Kelamin (L/P)"
            value={formData.jenis_kelamin}
            onChangeText={(value) => handleInputChange('jenis_kelamin', value.toUpperCase())}
            maxLength={1}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Text style={styles.sectionTitle}>Alamat</Text>

        <View style={styles.inputContainer}>
          <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Alamat Lengkap"
            value={formData.alamat}
            onChangeText={(value) => handleInputChange('alamat', value)}
            multiline
            numberOfLines={2}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <TextInput
              style={styles.input}
              placeholder="RT"
              value={formData.rt}
              onChangeText={(value) => handleInputChange('rt', value)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View style={[styles.inputContainer, styles.halfWidth]}>
            <TextInput
              style={styles.input}
              placeholder="RW"
              value={formData.rw}
              onChangeText={(value) => handleInputChange('rw', value)}
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kelurahan/Desa"
            value={formData.kelurahan}
            onChangeText={(value) => handleInputChange('kelurahan', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kecamatan"
            value={formData.kecamatan}
            onChangeText={(value) => handleInputChange('kecamatan', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Kabupaten/Kota"
            value={formData.kabupaten}
            onChangeText={(value) => handleInputChange('kabupaten', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Provinsi"
            value={formData.provinsi}
            onChangeText={(value) => handleInputChange('provinsi', value)}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <Text style={styles.sectionTitle}>Kontak</Text>

        <View style={styles.inputContainer}>
          <Mail size={20} color="#6B7280" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <CustomButton
          title={loading ? "Mendaftar..." : "Selesaikan Registrasi"}
          onPress={handleRegisterPemilih}
          disabled={loading}
          style={styles.registerButton}
        />

        <Text style={styles.requiredNote}>* Field wajib diisi</Text>
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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  registerButton: {
    marginTop: 20,
  },
  requiredNote: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});