// ─── Supabase / App types ───────────────────────────────────────────────────

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export interface DiaryEntry {
  id: string
  user_id: string
  anilist_id: number
  anime_title: string
  anime_cover_url: string | null
  genres: string[] | null
  date_started: string | null
  date_completed: string | null
  rating: number | null
  rewatch: boolean
  notes: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface List {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  list_type: "watchlist" | "favorites" | "custom"
  created_at: string
  updated_at: string
  profiles?: Profile
  item_count?: number
  preview_covers?: string[]
}

export interface ListItem {
  id: string
  list_id: string
  anilist_id: number
  anime_title: string
  anime_cover_url: string | null
  position: number
  notes: string | null
  added_at: string
}

export interface Review {
  id: string
  user_id: string
  anilist_id: number
  anime_title: string
  anime_cover_url: string | null
  rating: number | null
  body: string
  contains_spoilers: boolean
  likes_count: number
  created_at: string
  updated_at: string
  profiles?: Profile
  user_liked?: boolean
}

export interface Comment {
  id: string
  review_id: string
  user_id: string
  body: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  activity_type: "diary_entry" | "review" | "list_created" | "list_item_added" | "follow"
  reference_id: string | null
  anilist_id: number | null
  anime_title: string | null
  anime_cover_url: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  profiles?: Profile
}

// ─── AniList API types ───────────────────────────────────────────────────────

export interface AniListTitle {
  romaji: string | null
  english: string | null
  native: string | null
}

export interface AniListCoverImage {
  large: string | null
  extraLarge: string | null
  medium: string | null
}

export interface AniListDate {
  year: number | null
  month: number | null
  day: number | null
}

export interface AniListMedia {
  id: number
  title: AniListTitle
  coverImage: AniListCoverImage
  bannerImage: string | null
  format: string | null
  episodes: number | null
  duration: number | null
  status: string | null
  genres: string[]
  averageScore: number | null
  popularity: number | null
  startDate: AniListDate | null
  endDate: AniListDate | null
  season: string | null
  seasonYear: number | null
  description: string | null
  studios?: { nodes: { name: string }[] }
  nextAiringEpisode?: { episode: number; airingAt: number } | null
  trailer?: { id: string; site: string } | null
  tags?: { name: string; rank: number; isMediaSpoiler: boolean }[]
  relations?: {
    edges: {
      relationType: string
      node: {
        id: number
        title: AniListTitle
        coverImage: AniListCoverImage
        type: string
      }
    }[]
  }
}

export interface AniListAiringSchedule {
  id: number
  airingAt: number
  episode: number
  media: AniListMedia
}

export interface AniListPageInfo {
  total: number | null
  currentPage: number
  lastPage: number | null
  hasNextPage: boolean
}

export interface AniListSearchResult {
  Page: {
    pageInfo: AniListPageInfo
    media: AniListMedia[]
  }
}

export interface AniListDetailResult {
  Media: AniListMedia
}

export interface AniListAiringResult {
  Page: {
    pageInfo: AniListPageInfo
    airingSchedules: AniListAiringSchedule[]
  }
}

// ─── API response shapes ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export interface ProfileStats {
  watched_count: number
  review_count: number
  list_count: number
  followers_count: number
  following_count: number
}
