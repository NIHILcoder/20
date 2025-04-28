export interface Artwork {
  id: number;
  title: string;
  prompt: string;
  image_url: string;
  created_at: string;
  is_public: boolean;
  is_liked: boolean;
  is_saved: boolean;
  likes_count: number;
  model: string;
}

export interface GroupedArtworks {
  [key: string]: Artwork[];
}

export interface PaginationData {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface HistoryResponse {
  artworks: Artwork[];
  groupedArtworks: GroupedArtworks;
  pagination: PaginationData;
}

export function getUserHistory(params: {
  userId: number;
  limit?: number;
  offset?: number;
  filter?: string;
  search?: string;
}): Promise<HistoryResponse>;

export function deleteArtworkFromHistory(artworkId: number, userId: number): Promise<void>;