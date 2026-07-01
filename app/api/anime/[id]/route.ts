import { getAnimeDetail } from "@/lib/anilist"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const ParamsSchema = z.object({
  id: z.coerce.number().int().positive("ID must be a positive integer"),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: rawId } = await params

  const parsed = ParamsSchema.safeParse({ id: rawId })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    )
  }

  try {
    const result = await getAnimeDetail(parsed.data.id)
    return NextResponse.json({ data: result })
  } catch (err) {
    console.error("getAnimeDetail error:", err)
    return NextResponse.json({ error: "Failed to fetch anime detail" }, { status: 502 })
  }
}
