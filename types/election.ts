export interface User {
  id_user: number;
  username: string;
  role: 'panitia' | 'bpd' | 'pemilih';
  created_at?: string;
  updated_at?: string;
  pemilih?: PemilihDetails;
}

export interface PemilihDetails {
  id_pemilih: number;
  user_id: number;
  nik: string;
  name: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_kelamin?: 'L' | 'P';
  alamat?: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kabupaten?: string;
  provinsi?: string;
  email: string;
  validate?: number;
  registered_at?: string;
  hasVoted: boolean;
  votedFor?: string;
}

export interface Candidate {
  id_candidate: number;
  name: string;
  photo: string;
  visi: string[]; // array of string
  misi: string[]; // array of string
}

export interface Schedule {
  id_schedule: number;
  start_time: string;
  end_time: string;
  description?: string;
}

export interface Vote {
  id_vote: number;
  pemilih_id: number;
  candidate_id: number;
  panitia_id?: number;
  voted_at?: string;
}

export interface VotingStatus {
  canVote: boolean;
  hasVoted: boolean;
  schedule?: Schedule;
  message: string;
}

export interface VotingWinner {
  candidate_id: number;
  candidate_name: string;
  vote_count: number;
  percentage?: number;
  photo?: string;
}
