
export enum PlatformMode {
  SPOTIFY = 'Spotify_Music',
  YOUTUBE = 'YouTube_Video'
}

export enum SortOrder {
  BPM = 'BPM',
  RELEVANCE = 'Relevance',
  CHRONOLOGICAL = 'Chronological',
  POPULARITY = 'Popularity'
}

export interface GroundingSource {
  title?: string;
  uri?: string;
}

export interface RequestProfile {
  targetLength: number;
  sortOrder: SortOrder;
  platformMode: PlatformMode | 'Auto';
  keywords: string;
  eraConstraint?: string;
  genderFocus?: string;
  specificSource?: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  creator: string; // Artist or Channel
  metadata: string; // BPM/Key or Views/Resolution
  url: string;
  score: number;
  releaseDate?: string;
  description?: string;
  thumbnail?: string;
  heuristics?: string[]; // Specific scoring reasons
  platformId?: string; // e.g., YouTube Video ID or Spotify Track ID
}

export interface ManualItem {
  id: string;
  title: string;
  creator: string;
  platformId?: string;
}

export interface GeneratorResult {
  profile: RequestProfile;
  items: PlaylistItem[];
  editorCommentary: string;
  vibeScore: number;
  isManualAnalysis?: boolean;
  sources?: GroundingSource[];
}

export interface SavedPlaylist {
  id: string;
  name: string;
  date: string;
  data: GeneratorResult;
}
