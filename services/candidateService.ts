import { Candidate } from '@/types/election';
import { buildApiUrl, buildRouteWithParams, API_CONFIG } from '@/config/api';

function stripHtmlTags(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.replace(/<[^>]*>/g, '').trim();
}

function sanitizeCandidate(candidate: Candidate): Candidate {
  const sanitizeArray = (items: unknown): string[] => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) => stripHtmlTags(item))
      .filter((item) => item.length > 0);
  };

  return {
    ...candidate,
    visi: sanitizeArray(candidate.visi),
    misi: sanitizeArray(candidate.misi),
  };
}

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
        const candidates = (Array.isArray(data.data) ? data.data : []) as Candidate[];
        return candidates.map((candidate) => sanitizeCandidate(candidate));
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
      
      if (data.status === 'success' && data.data) {
        return sanitizeCandidate(data.data as Candidate);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      return null;
    }
  }
}