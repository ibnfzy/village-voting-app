import { Vote, VotingStatus, Schedule, VotingWinner } from '@/types/election';
import { buildApiUrl, API_CONFIG } from '@/config/api';

export class VotingService {
  static async getVotingStatus(pemilihId: number): Promise<VotingStatus> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.VOTING.STATUS), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pemilih_id: pemilihId }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data;
      }
      
      return {
        canVote: false,
        hasVoted: false,
        message: 'Tidak dapat mengecek status voting'
      };
    } catch (error) {
      console.error('Error checking voting status:', error);
      return {
        canVote: false,
        hasVoted: false,
        message: 'Terjadi kesalahan saat mengecek status voting'
      };
    }
  }

  static async submitVote(pemilihId: number, candidateId: number): Promise<'success' | 'voting closed' | 'already voted' | 'error'> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.VOTING.VOTE), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pemilih_id: pemilihId, 
          candidate_id: candidateId 
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return 'success';
      } else if (data.status === 'voting closed') {
        return 'voting closed';
      } else if (data.status === 'already voted') {
        return 'already voted';
      }
      
      return 'error';
    } catch (error) {
      console.error('Error submitting vote:', error);
      return 'error';
    }
  }

  static async getVotingSchedule(): Promise<Schedule | null> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.VOTING.SCHEDULE), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching voting schedule:', error);
      return null;
    }
  }

  static async getVotingResults(): Promise<{ candidate_id: number; vote_count: number; candidate_name: string }[]> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.VOTING.RESULTS), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        return data.data || [];
      }

      return [];
    } catch (error) {
      console.error('Error fetching voting results:', error);
      return [];
    }
  }

  static async getVotingWinner(): Promise<VotingWinner | null> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.VOTING.WINNER), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.status === 'success') {
        const winnerData = Array.isArray(data.data)
          ? data.data[0]
          : data.data;

        if (!winnerData) {
          return null;
        }

        return {
          candidate_id: Number(winnerData.candidate_id),
          candidate_name: winnerData.candidate_name,
          vote_count: Number(winnerData.vote_count),
          percentage: winnerData.percentage
            ? Number(winnerData.percentage)
            : undefined,
          photo: winnerData.photo,
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching voting winner:', error);
      return null;
    }
  }
}
