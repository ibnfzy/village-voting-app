import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Candidate } from '@/types/election';

interface CandidateCardProps {
  candidate: Candidate;
  onPress: () => void;
}

export function CandidateCard({ candidate, onPress }: CandidateCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <Image source={{ uri: candidate.photo }} style={styles.photo} />
        <View style={styles.info}>
          <Text style={styles.name}>{candidate.name}</Text>
        </View>
      </View>

      <View style={styles.visionContainer}>
      <Text style={styles.visionLabel}>Visi:</Text>
      {candidate.visi.map((v, i) => (
        <Text key={i} style={styles.vision}>
          • {v}
        </Text>
      ))}
    </View>

    <View style={styles.visionContainer}>
      <Text style={styles.visionLabel}>Misi:</Text>
      {candidate.misi.map((m, i) => (
        <Text key={i} style={styles.vision}>
          • {m}
        </Text>
      ))}
    </View>

      <View style={styles.footer}>
        <Text style={styles.viewMore}>Lihat Detail →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  party: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  education: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  visionContainer: {
    marginBottom: 16,
  },
  visionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 4,
  },
  vision: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'flex-end',
  },
  viewMore: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
});
