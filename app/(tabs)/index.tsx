import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { Clock, Users, TrendingUp, Calendar, Vote } from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/contexts/AuthContext';
import { CandidateService } from '@/services/candidateService';
import { VotingService } from '@/services/votingService';
import { Candidate, VotingStatus } from '@/types/election';

export default function Home() {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
  const [votingResults, setVotingResults] = useState<{ candidate_id: number; vote_count: number; candidate_name: string }[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace('/auth');
    } else {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.pemilih?.id_pemilih) return;

    const [candidatesData, statusData, resultsData] = await Promise.all([
      CandidateService.getAllCandidates(),
      VotingService.getVotingStatus(user.pemilih.id_pemilih),
      VotingService.getVotingResults()
    ]);
    
    setCandidates(candidatesData);
    setVotingStatus(statusData);
    setVotingResults(resultsData);
  };

  if (!user) return null;

  const totalVotes = votingResults.reduce((sum, result) => sum + result.vote_count, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.welcomeText}>Selamat datang,</Text>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
        <Image
          source={{ uri: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }}
          style={styles.userAvatar}
        />
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          {votingStatus?.hasVoted ? (
            <TrendingUp size={24} color="#10B981" />
          ) : (
            <Clock size={24} color="#F59E0B" />
          )}
        </View>
        <View style={styles.statusContent}>
          <Text style={styles.statusTitle}>
            {votingStatus?.hasVoted ? 'Suara Anda Sudah Tercatat' : 'Belum Voting'}
          </Text>
          <Text style={styles.statusDescription}>
            {votingStatus?.hasVoted 
              ? `Terima kasih telah berpartisipasi dalam pemilihan kepala desa`
              : 'Jangan lupa gunakan hak pilih Anda sebelum masa voting berakhir'
            }
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Users size={20} color="#DC2626" />
          <Text style={styles.statNumber}>{candidates.length}</Text>
          <Text style={styles.statLabel}>Calon</Text>
        </View>
        <View style={styles.statCard}>
          <Vote size={20} color="#DC2626" />
          <Text style={styles.statNumber}>{totalVotes}</Text>
          <Text style={styles.statLabel}>Total Suara</Text>
        </View>
        <View style={styles.statCard}>
          <Calendar size={20} color="#DC2626" />
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Hari Tersisa</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.actionButtons}>
          <CustomButton
            title="Lihat Calon"
            onPress={() => router.push('/(tabs)/candidates')}
            style={styles.actionButton}
          />
          {!votingStatus?.hasVoted && votingStatus?.canVote && (
            <CustomButton
              title="Mulai Voting"
              onPress={() => router.push('/(tabs)/vote')}
              variant="secondary"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>

      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>Informasi Terkini</Text>
        <View style={styles.newsCard}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/6792340/pexels-photo-6792340.jpeg?auto=compress&cs=tinysrgb&w=400' }}
            style={styles.newsImage}
          />
          <View style={styles.newsContent}>
            <Text style={styles.newsTitle}>Pemilihan Kepala Desa 2024</Text>
            <Text style={styles.newsDescription}>
              Masa voting telah dimulai. Pastikan Anda menggunakan hak pilih dengan bijak.
            </Text>
            <Text style={styles.newsDate}>15 Januari 2024</Text>
          </View>
        </View>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  quickActions: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  newsSection: {
    marginBottom: 20,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  newsImage: {
    width: '100%',
    height: 160,
  },
  newsContent: {
    padding: 20,
  },
  newsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  newsDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
});