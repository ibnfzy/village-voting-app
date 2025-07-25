import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Vote as VoteIcon, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Clock, Calendar, Timer } from 'lucide-react-native';
import { CandidateCard } from '@/components/CandidateCard';
import { CustomButton } from '@/components/CustomButton';
import { useAuth } from '@/contexts/AuthContext';
import { CandidateService } from '@/services/candidateService';
import { VotingService } from '@/services/votingService';
import { Candidate, VotingStatus } from '@/types/election';

export default function Vote() {
  const { user } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votingStatus, setVotingStatus] = useState<VotingStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isVotingDay, setIsVotingDay] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (votingStatus?.schedule) {
      const timer = setInterval(() => {
        updateCountdown();
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [votingStatus]);

  const updateCountdown = () => {
    if (!votingStatus?.schedule) return;

    const now = new Date().getTime();
    const startTime = new Date(votingStatus.schedule.start_time).getTime();
    const endTime = new Date(votingStatus.schedule.end_time).getTime();

    // Check if it's voting day (between start and end time)
    if (now >= startTime && now <= endTime) {
      setIsVotingDay(true);
      // Calculate countdown to end time
      const timeLeft = endTime - now;
      
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown(null);
      }
    } else if (now < startTime) {
      setIsVotingDay(false);
      // Calculate countdown to start time
      const timeLeft = startTime - now;
      
      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        setCountdown({ days, hours, minutes, seconds });
      } else {
        setCountdown(null);
      }
    } else {
      setIsVotingDay(false);
      setCountdown(null);
    }
  };

  const loadData = async () => {
    if (!user?.pemilih?.id_pemilih) return;

    setStatusLoading(true);
    
    // Load candidates and voting status
    const [candidatesData, statusData] = await Promise.all([
      CandidateService.getAllCandidates(),
      VotingService.getVotingStatus(user.pemilih.id_pemilih)
    ]);
    
    setCandidates(candidatesData);
    setVotingStatus(statusData);
    setStatusLoading(false);
  };

  const handleVote = () => {
    if (!selectedCandidate) {
      Alert.alert('Peringatan', 'Silakan pilih salah satu calon terlebih dahulu');
      return;
    }

    if (!votingStatus?.canVote) {
      Alert.alert('Voting Tidak Tersedia', votingStatus?.message || 'Voting sedang tidak tersedia');
      return;
    }

    const candidate = candidates.find(c => c.id_candidate.toString() === selectedCandidate);
    
    Alert.alert(
      'Konfirmasi Voting',
      `Apakah Anda yakin ingin memilih ${candidate?.name}?\n\nPilihan tidak dapat diubah setelah dikonfirmasi.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Pilih', onPress: confirmVote }
      ]
    );
  };

  const confirmVote = async () => {
    if (!selectedCandidate || !user?.pemilih?.id_pemilih) return;

    setLoading(true);
    
    try {
      const result = await VotingService.submitVote(
        user.pemilih.id_pemilih, 
        parseInt(selectedCandidate)
      );

      if (result === 'success') {
        Alert.alert(
          'Voting Berhasil',
          'Terima kasih telah menggunakan hak pilih Anda!',
          [{ text: 'OK', onPress: () => {
            // Reload voting status
            loadData();
            router.push('/(tabs)');
          }}]
        );
      } else if (result === 'voting closed') {
        Alert.alert('Error', 'Masa voting telah berakhir');
      } else if (result === 'already voted') {
        Alert.alert('Error', 'Anda sudah melakukan voting sebelumnya');
      } else {
        Alert.alert('Error', 'Terjadi kesalahan saat voting');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi kesalahan saat voting');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (statusLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Mengecek status voting...</Text>
      </View>
    );
  }

  if (votingStatus?.hasVoted) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <CheckCircle size={48} color="#10B981" />
          <Text style={styles.title}>Voting Selesai</Text>
          <Text style={styles.subtitle}>
            Anda telah memberikan suara
          </Text>
        </View>

        <View style={styles.thankYouSection}>
          <Text style={styles.thankYou}>
            Terima kasih telah berpartisipasi dalam pemilihan kepala desa!
          </Text>
          <CustomButton
            title="Kembali ke Beranda"
            onPress={() => router.push('/(tabs)')}
          />
        </View>
      </ScrollView>
    );
  }

  if (!votingStatus?.canVote) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Clock size={48} color="#F59E0B" />
          <Text style={styles.title}>Voting Belum Tersedia</Text>
          <Text style={styles.subtitle}>
            {votingStatus?.message || 'Masa voting belum dimulai'}
          </Text>
        </View>

        {votingStatus?.schedule && (
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              {isVotingDay ? (
                <Timer size={20} color="#10B981" />
              ) : (
                <Calendar size={20} color="#DC2626" />
              )}
              <Text style={styles.scheduleTitle}>Jadwal Voting</Text>
            </View>
            <View style={styles.scheduleContent}>
              {isVotingDay ? (
                <>
                  <Text style={styles.scheduleLabel}>Voting sedang berlangsung!</Text>
                  {countdown && (
                    <View style={styles.countdownContainer}>
                      <Text style={styles.countdownLabel}>Sisa waktu:</Text>
                      <View style={styles.countdownGrid}>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.days}</Text>
                          <Text style={styles.countdownUnit}>Hari</Text>
                        </View>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.hours}</Text>
                          <Text style={styles.countdownUnit}>Jam</Text>
                        </View>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
                          <Text style={styles.countdownUnit}>Menit</Text>
                        </View>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.seconds}</Text>
                          <Text style={styles.countdownUnit}>Detik</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <>
                  {countdown && countdown.days > 0 ? (
                    <View style={styles.countdownContainer}>
                      <Text style={styles.countdownLabel}>Voting dimulai dalam:</Text>
                      <View style={styles.countdownGrid}>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.days}</Text>
                          <Text style={styles.countdownUnit}>Hari</Text>
                        </View>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.hours}</Text>
                          <Text style={styles.countdownUnit}>Jam</Text>
                        </View>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.minutes}</Text>
                          <Text style={styles.countdownUnit}>Menit</Text>
                        </View>
                        <View style={styles.countdownItem}>
                          <Text style={styles.countdownNumber}>{countdown.seconds}</Text>
                          <Text style={styles.countdownUnit}>Detik</Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.scheduleLabel}>Mulai:</Text>
                      <Text style={styles.scheduleTime}>
                        {formatDateTime(votingStatus.schedule.start_time)}
                      </Text>
                      <Text style={styles.scheduleLabel}>Berakhir:</Text>
                      <Text style={styles.scheduleTime}>
                        {formatDateTime(votingStatus.schedule.end_time)}
                      </Text>
                    </>
                  )}
                </>
              )}
              {votingStatus.schedule.description && (
                <>
                  <Text style={styles.scheduleLabel}>Keterangan:</Text>
                  <Text style={styles.scheduleDescription}>
                    {votingStatus.schedule.description}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            Silakan kembali saat masa voting telah dimulai untuk menggunakan hak pilih Anda.
          </Text>
          <CustomButton
            title="Kembali ke Beranda"
            onPress={() => router.push('/(tabs)')}
            variant="secondary"
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <VoteIcon size={32} color="#DC2626" />
        <Text style={styles.title}>Pilih Calon Anda</Text>
        <Text style={styles.subtitle}>
          Pilih salah satu calon kepala desa dengan bijak
        </Text>
      </View>

      {votingStatus?.schedule && (
        <View style={styles.scheduleInfo}>
          {isVotingDay ? (
            <Timer size={16} color="#10B981" />
          ) : (
            <Clock size={16} color="#F59E0B" />
          )}
          <Text style={styles.scheduleInfoText}>
            {isVotingDay 
              ? `Voting berakhir: ${formatDateTime(votingStatus.schedule.end_time)}`
              : `Voting dimulai: ${formatDateTime(votingStatus.schedule.start_time)}`
            }
          </Text>
        </View>
      )}

      <View style={styles.warningBox}>
        <AlertCircle size={20} color="#F59E0B" />
        <Text style={styles.warningText}>
          Pilihan tidak dapat diubah setelah dikonfirmasi. Pastikan pilihan Anda sudah tepat.
        </Text>
      </View>

      <View style={styles.candidatesList}>
        {candidates.map((candidate) => (
          <View key={candidate.id_candidate} style={styles.candidateWrapper}>
            <View style={[
              styles.selectionIndicator,
              selectedCandidate === candidate.id_candidate.toString() && styles.selectedIndicator
            ]}>
              {selectedCandidate === candidate.id_candidate.toString() && (
                <CheckCircle size={24} color="#10B981" />
              )}
            </View>
            <View style={styles.candidateContent}>
              <CandidateCard
                candidate={candidate}
                onPress={() => setSelectedCandidate(candidate.id_candidate.toString())}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.voteSection}>
        <CustomButton
          title={loading ? "Memproses..." : "Konfirmasi Pilihan"}
          onPress={handleVote}
          disabled={!selectedCandidate || loading}
          style={styles.voteButton}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  scheduleCard: {
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
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  scheduleContent: {
    gap: 8,
  },
  scheduleLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  scheduleTime: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    marginBottom: 8,
  },
  scheduleDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  countdownContainer: {
    marginTop: 16,
  },
  countdownLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  countdownGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  countdownItem: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    minWidth: 60,
  },
  countdownNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
  },
  countdownUnit: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  scheduleInfoText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  candidatesList: {
    marginBottom: 32,
  },
  candidateWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  selectionIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  selectedIndicator: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
  },
  candidateContent: {
    flex: 1,
  },
  voteSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  voteButton: {
    width: '100%',
  },
  thankYouSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  thankYou: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
});