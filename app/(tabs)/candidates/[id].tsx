import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Target, CircleCheck as CheckCircle } from 'lucide-react-native';
import { CustomButton } from '@/components/CustomButton';
import { CandidateService } from '@/services/candidateService';
import { Candidate } from '@/types/election';

export default function CandidateDetail() {
  const { id } = useLocalSearchParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCandidate();
    }
  }, [id]);

  const loadCandidate = async () => {
    setLoading(true);
    const data = await CandidateService.getCandidateById(Number(id));
    setCandidate(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Memuat data calon...</Text>
      </View>
    );
  }

  if (!candidate) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Calon tidak ditemukan</Text>
      </View>
    );
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
      </View>

      <View style={styles.candidateHeader}>
        <Image source={{ uri: candidate.photo }} style={styles.photo} />
        <View style={styles.candidateInfo}>
          <Text style={styles.name}>{candidate.name}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={20} color="#DC2626" />
          <Text style={styles.sectionTitle}>Visi</Text>
        </View>
        <Text style={styles.visionText}>{candidate.visi}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Misi</Text>
        <Text style={styles.missionText}>{candidate.misi}</Text>
      </View>

      <View style={styles.voteSection}>
        <CustomButton
          title="Pilih Calon Ini"
          onPress={() => router.push('/(tabs)/vote')}
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
    paddingBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    paddingVertical: 0,
  },
  backButtonText: {
    fontSize: 20,
  },
  candidateHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  candidateInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  visionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
  },
  missionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  voteSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
  },
  voteButton: {
    width: '100%',
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
});