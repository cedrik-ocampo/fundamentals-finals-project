import { getAiringSchedule } from "@/lib/anilist"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const QuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const parsed = QuerySchema.safeParse({
    page: searchParams.get("page") ?? 1,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  try {
    const result = await getAiringSchedule(parsed.data.page)
    return NextResponse.json({ data: result })
  } catch (err) {
    console.error("getAiringSchedule error:", err)
    return NextResponse.json({ error: "Failed to fetch airing schedule" }, { status: 502 })
  }
}

