import { getSeasonalAnime } from "@/lib/anilist"
import { currentSeason } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const QuerySchema = z.object({
  season: z
    .enum(["WINTER", "SPRING", "SUMMER", "FALL"])
    .optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  page: z.coerce.number().int().positive().default(1),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const parsed = QuerySchema.safeParse({
    season: searchParams.get("season") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    page: searchParams.get("page") ?? 1,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  const defaults = currentSeason()
  const season = parsed.data.season ?? defaults.season
  const year = parsed.data.year ?? defaults.year

  try {
    const result = await getSeasonalAnime(season, year, parsed.data.page)
    return NextResponse.json({ data: result })
  } catch (err) {
    console.error("getSeasonalAnime error:", err)
    return NextResponse.json({ error: "Failed to fetch seasonal anime" }, { status: 502 })
  }
}

