import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Mail,
  CreditCard,
  MapPin,
  Calendar,
  Users,
  Camera as CameraIcon,
  UploadCloud,
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Camera as ExpoCamera, CameraView, type CameraType } from 'expo-camera';

import { CustomButton } from '@/components/CustomButton';
import {
  useAuth,
  PemilihRegistrationData,
  PemilihRegistrationPayload,
} from '@/contexts/AuthContext';

interface KtpFile {
  uri: string;
  name: string;
  type: string;
}

export default function Register() {
  const { registerPemilih } = useAuth();
  const [formData, setFormData] = useState<PemilihRegistrationData>({
    nik: '',
    name: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: undefined,
    alamat: '',
    rt: '',
    rw: '',
    kelurahan: '',
    kecamatan: 'Balantak Utara',
    kabupaten: 'Banggai',
    provinsi: 'Sulawesi Tengah',
    email: '',
  });
  const [ktpFile, setKtpFile] = useState<KtpFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const cameraFacing: CameraType = 'back';
  const cameraRef = useRef<CameraView | null>(null);

  const ensureCameraPermission = useCallback(async () => {
    const { status } = await ExpoCamera.requestCameraPermissionsAsync();
    const granted = status === 'granted';
    setHasCameraPermission(granted);
    return granted;
  }, []);

  useEffect(() => {
    ensureCameraPermission();
  }, [ensureCameraPermission]);

  const handleInputChange = (
    field: keyof PemilihRegistrationData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenderChange = (value: string) => {
    const formatted = value.toUpperCase();

    if (formatted === 'L' || formatted === 'P') {
      setFormData((prev) => ({ ...prev, jenis_kelamin: formatted }));
      return;
    }

    if (value.trim() === '') {
      setFormData((prev) => ({ ...prev, jenis_kelamin: undefined }));
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setKtpFile({
          uri: asset.uri,
          name: asset.name || `ktp-${Date.now()}`,
          type: asset.mimeType || 'image/jpeg',
        });
      }
    } catch (pickError) {
      Alert.alert(
        'Gagal mengunggah',
        'Terjadi kesalahan saat memilih dokumen.'
      );
    }
  };

  const handleOpenCamera = async () => {
    const granted =
      hasCameraPermission === true ? true : await ensureCameraPermission();

    if (!granted) {
      Alert.alert(
        'Izin Kamera',
        'Aplikasi memerlukan izin kamera untuk mengambil foto KTP.'
      );
      return;
    }

    setIsCameraVisible(true);
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      setKtpFile({
        uri: photo.uri,
        name: `ktp-${Date.now()}.jpg`,
        type: 'image/jpeg',
      });
      setIsCameraVisible(false);
    } catch (captureError) {
      Alert.alert('Gagal mengambil foto', 'Silakan coba lagi.');
    }
  };

  const handleRegisterPemilih = async () => {
    setError('');

    if (!formData.nik || !formData.name || !formData.email) {
      setError('NIK, Nama, dan Email wajib diisi');
      return;
    }

    if (formData.nik.length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }

    if (!formData.tanggal_lahir) {
      setError('Tanggal lahir wajib diisi');
      return;
    }

    const birthDate = new Date(formData.tanggal_lahir);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 17) {
      setError('Minimal usia untuk registrasi adalah 17 tahun');
      return;
    }

    if (!ktpFile) {
      setError('Foto atau dokumen KTP wajib diunggah');
      return;
    }

    setLoading(true);
    try {
      const payload: PemilihRegistrationPayload = {
        ...formData,
        jenis_kelamin: formData.jenis_kelamin,
        file_ktp: {
          uri:
            Platform.OS === 'ios'
              ? ktpFile.uri.replace('file://', '')
              : ktpFile.uri,
          name: ktpFile.name,
          type: ktpFile.type,
        },
      };

      const result = await registerPemilih(payload);
      if (result === 'registration successful') {
        Alert.alert('Registrasi Berhasil', 'Akun Anda telah berhasil dibuat!', [
          { text: 'OK', onPress: () => router.replace('/') },
        ]);
      } else if (result === 'email not available') {
        setError('Email sudah digunakan');
      } else if (result === 'nik not available') {
        setError('NIK sudah terdaftar');
      }
    } catch (registerError) {
      setError('Terjadi kesalahan saat mendaftar');
    } finally {
      setLoading(false);
    }
  };

  const isImageFile = ktpFile?.type?.startsWith('image/');

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <CustomButton
            title="←"
            onPress={() => router.back()}
            variant="secondary"
            style={styles.backButton}
            textStyle={styles.backButtonText}
          />
          <Text style={styles.title}>Buat Akun</Text>
          <Text style={styles.subtitle}>
            Lengkapi data KTP Anda untuk menyelesaikan registrasi
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
              onChangeText={(value) =>
                handleInputChange('tanggal_lahir', value)
              }
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <Users size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Jenis Kelamin (L/P)"
              value={formData.jenis_kelamin ?? ''}
              onChangeText={handleGenderChange}
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
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.row}>
            <View style={styles.rowInputWrapper}>
              <Text style={styles.rowLabel}>RT</Text>
              <TextInput
                style={styles.rowInput}
                placeholder="RT"
                value={formData.rt}
                onChangeText={(value) => handleInputChange('rt', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.rowInputWrapper}>
              <Text style={styles.rowLabel}>RW</Text>
              <TextInput
                style={styles.rowInput}
                placeholder="RW"
                value={formData.rw}
                onChangeText={(value) => handleInputChange('rw', value)}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kelurahan"
              value={formData.kelurahan}
              onChangeText={(value) => handleInputChange('kelurahan', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kecamatan"
              value={formData.kecamatan}
              onChangeText={(value) => handleInputChange('kecamatan', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Kabupaten"
              value={formData.kabupaten}
              onChangeText={(value) => handleInputChange('kabupaten', value)}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputContainer}>
            <MapPin size={20} color="#6B7280" style={styles.inputIcon} />
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
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.sectionTitle}>Dokumen KTP</Text>

          <View style={styles.uploadActions}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickDocument}
            >
              <UploadCloud
                size={20}
                color="#DC2626"
                style={styles.uploadIcon}
              />
              <Text style={styles.uploadButtonText}>Unggah Dokumen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleOpenCamera}
            >
              <CameraIcon size={20} color="#DC2626" style={styles.uploadIcon} />
              <Text style={styles.uploadButtonText}>Ambil Foto</Text>
            </TouchableOpacity>
          </View>

          {ktpFile ? (
            <View style={styles.filePreview}>
              {isImageFile ? (
                <Image
                  source={{ uri: ktpFile.uri }}
                  style={styles.ktpPreview}
                />
              ) : (
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{ktpFile.name}</Text>
                  <Text style={styles.fileType}>{ktpFile.type}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setKtpFile(null)}
                style={styles.removeFileButton}
              >
                <Text style={styles.removeFileText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.uploadHint}>
              Unggah foto KTP yang jelas atau ambil foto langsung menggunakan
              kamera.
            </Text>
          )}

          <CustomButton
            title={loading ? 'Memproses...' : 'Daftar Sekarang'}
            onPress={handleRegisterPemilih}
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

      <Modal visible={isCameraVisible} animationType="slide">
        <View style={styles.cameraModal}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraFacing}
          >
            <View style={styles.cameraOverlay}>
              <TouchableOpacity
                style={styles.closeCameraButton}
                onPress={() => setIsCameraVisible(false)}
              >
                <Text style={styles.closeCameraText}>Tutup</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleCapturePhoto}
              >
                <Text style={styles.captureButtonText}>Ambil Foto</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </>
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
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
    marginTop: 8,
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
  rowInputWrapper: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  rowInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  uploadActions: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 12,
    flex: 1,
  },
  uploadIcon: {
    marginRight: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  uploadHint: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  filePreview: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  ktpPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  fileInfo: {
    gap: 4,
  },
  fileName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#111827',
  },
  fileType: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  removeFileButton: {
    alignSelf: 'flex-end',
  },
  removeFileText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  registerButton: {
    marginTop: 12,
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
  cameraModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: 'transparent',
  },
  closeCameraButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeCameraText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
  captureButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 30,
    marginBottom: 24,
  },
  captureButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
});
