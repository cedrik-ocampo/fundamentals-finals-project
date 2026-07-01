import type {
  AniListSearchResult,
  AniListDetailResult,
  AniListAiringResult,
} from "@/lib/types"

const ANILIST_URL = "https://graphql.anilist.co"

async function anilistFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  cacheOptions?: RequestInit["next"]
): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
    next: cacheOptions ?? { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`AniList request failed: ${res.status}`)
  }

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }
  return json.data as T
}

// ─── Queries ─────────────────────────────────────────────────────────────────

const SEARCH_QUERY = `
  query SearchAnime($search: String!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total currentPage lastPage hasNextPage }
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title { romaji english }
        coverImage { large }
        format
        episodes
        status
        averageScore
        genres
        startDate { year }
      }
    }
  }
`

const DETAIL_QUERY = `
  query AnimeDetail($id: Int!) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      description(asHtml: false)
      coverImage { extraLarge large }
      bannerImage
      format
      episodes
      duration
      status
      genres
      tags { name rank isMediaSpoiler }
      averageScore
      popularity
      studios(isMain: true) { nodes { name } }
      startDate { year month day }
      endDate { year month day }
      season
      seasonYear
      trailer { id site }
      nextAiringEpisode { episode airingAt }
      relations {
        edges {
          relationType(version: 2)
          node { id title { romaji } coverImage { medium } type }
        }
      }
    }
  }
`

const SEASONAL_QUERY = `
  query SeasonalAnime($season: MediaSeason!, $year: Int!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { total hasNextPage }
      media(season: $season, seasonYear: $year, type: ANIME,
            sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english }
        coverImage { large }
        bannerImage
        format
        episodes
        averageScore
        genres
        status
        startDate { year month day }
        nextAiringEpisode { episode airingAt }
        studios(isMain: true) { nodes { name } }
      }
    }
  }
`

const AIRING_QUERY = `
  query AiringSchedule($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage }
      airingSchedules(notYetAired: true, sort: TIME) {
        id
        airingAt
        episode
        media {
          id
          title { romaji english }
          coverImage { large }
          format
          episodes
          status
          genres
          averageScore
        }
      }
    }
  }
`

const BATCH_QUERY = `
  query AnimeBatch($ids: [Int], $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(id_in: $ids, type: ANIME) {
        id
        title { romaji english }
        coverImage { large }
        format
        episodes
        averageScore
        status
      }
    }
  }
`

// ─── Exported functions ───────────────────────────────────────────────────────

export async function searchAnime(
  search: string,
  page = 1,
  perPage = 20
): Promise<AniListSearchResult> {
  return anilistFetch<AniListSearchResult>(
    SEARCH_QUERY,
    { search, page, perPage },
    { revalidate: 0 } // search is user-driven, no cache
  )
}

export async function getAnimeDetail(id: number): Promise<AniListDetailResult> {
  return anilistFetch<AniListDetailResult>(DETAIL_QUERY, { id })
}

export async function getSeasonalAnime(
  season: string,
  year: number,
  page = 1,
  perPage = 24
): Promise<AniListSearchResult> {
  return anilistFetch<AniListSearchResult>(SEASONAL_QUERY, {
    season,
    year,
    page,
    perPage,
  })
}

export async function getAiringSchedule(
  page = 1,
  perPage = 50
): Promise<AniListAiringResult> {
  return anilistFetch<AniListAiringResult>(
    AIRING_QUERY,
    { page, perPage },
    { revalidate: 1800 }
  )
}

export async function getAnimeBatch(
  ids: number[],
  page = 1,
  perPage = 50
): Promise<AniListSearchResult> {
  return anilistFetch<AniListSearchResult>(BATCH_QUERY, { ids, page, perPage })
}

export function getAnimeTitle(
  title: { romaji: string | null; english: string | null } | undefined
): string {
  return title?.english ?? title?.romaji ?? "Unknown Title"
}
