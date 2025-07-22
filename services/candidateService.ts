import { Candidate } from '@/types/election';
import { buildApiUrl, buildRouteWithParams, API_CONFIG } from '@/config/api';

export class CandidateService {
  static async getAllCandidates(): Promise<Candidate[]> {
    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ROUTES.CANDIDATES.LIST), {
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
      console.error('Error fetching candidates:', error);
      return [];
    }
  }

  static async getCandidateById(id_candidate: number): Promise<Candidate | null> {
    try {
      const route = buildRouteWithParams(API_CONFIG.ROUTES.CANDIDATES.DETAIL, {
        id_candidate: id_candidate.toString()
      });
      
      const response = await fetch(buildApiUrl(route), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data || null;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      return null;
    }
  }
}