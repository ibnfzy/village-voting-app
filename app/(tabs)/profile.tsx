import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  User,
  Mail,
  CreditCard,
  MapPin,
  CircleCheck as CheckCircle,
  LogOut,
  Settings,
  Award,
} from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/contexts/AuthContext';
import { VotingService } from '@/services/votingService';
import { VotingStatus } from '@/types/election';

export default function Profile() {
  const { user, logout } = useAuth();
  const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);

  useEffect(() => {
    loadVotingStatus();
  }, []);

  const loadVotingStatus = async () => {
    if (!user?.pemilih?.id_pemilih) return;

    const status = await VotingService.getVotingStatus(user.pemilih.id_pemilih);
    setVotingStatus(status);
  };

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Logout',
      'Apakah Anda yakin ingin keluar dari akun?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.name}>{user.pemilih?.name || user.username}</Text>
        <Text style={styles.email}>
          {user.pemilih?.email || 'Email tidak tersedia'}
        </Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <User size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Nama Lengkap</Text>
            <Text style={styles.infoValue}>
              {user.pemilih?.name || 'Tidak tersedia'}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <CreditCard size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>NIK</Text>
            <Text style={styles.infoValue}>
              {user.pemilih?.nik || 'Tidak tersedia'}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <Mail size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>
              {user.pemilih?.email || 'Tidak tersedia'}
            </Text>
          </View>
        </View>

        <View style={styles.infoItem}>
          <MapPin size={20} color="#6B7280" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Alamat</Text>
            <Text style={styles.infoValue}>
              {user.pemilih?.alamat
                ? `${user.pemilih.alamat}, RT ${user.pemilih.rt}/RW ${user.pemilih.rw}, ${user.pemilih.kelurahan}, ${user.pemilih.kecamatan}`
                : 'Tidak tersedia'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Text style={styles.sectionTitle}>Status Voting</Text>
          {votingStatus?.hasVoted ? (
            <CheckCircle size={20} color="#10B981" />
          ) : (
            <View style={styles.pendingIcon} />
          )}
        </View>

        {votingStatus?.hasVoted ? (
          <View style={styles.votedInfo}>
            <Text style={styles.statusText}>✅ Sudah voting</Text>
            <Text style={styles.statusDescription}>
              Terima kasih telah berpartisipasi dalam pemilihan
            </Text>
          </View>
        ) : (
          <View style={styles.notVotedInfo}>
            <Text style={styles.statusText}>⏳ Belum voting</Text>
            <Text style={styles.statusDescription}>
              {votingStatus?.canVote
                ? 'Jangan lupa gunakan hak pilih Anda'
                : votingStatus?.message || 'Masa voting belum dimulai'}
            </Text>
            {votingStatus?.canVote && (
              <CustomButton
                title="Voting Sekarang"
                onPress={() => router.push('/(tabs)/vote')}
                style={styles.voteButton}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>

        <View style={styles.actionButtons}>
          <CustomButton
            title="Edit Profil"
            onPress={() =>
              Alert.alert('Info', 'Fitur edit profil akan segera tersedia')
            }
            variant="secondary"
            style={styles.actionButton}
          />

          <CustomButton
            title="Keluar"
            onPress={handleLogout}
            variant="danger"
            style={styles.actionButton}
          />
        </View>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>Aplikasi Pilkada Desa v1.0.0</Text>
        <Text style={styles.appInfoText}>© 2024 Sistem Pemilihan Digital</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  pendingIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
  },
  votedInfo: {
    alignItems: 'flex-start',
  },
  notVotedInfo: {
    alignItems: 'flex-start',
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 8,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  voteButton: {
    alignSelf: 'flex-start',
  },
  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtons: {
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    width: '100%',
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 20,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    marginBottom: 4,
  },
});
