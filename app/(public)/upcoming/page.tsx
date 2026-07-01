import Link from "next/link"
import Image from "next/image"
import { Calendar } from "lucide-react"
import AiringCountdown from "@/components/anime/AiringCountdown"
import type { AniListAiringSchedule } from "@/lib/types"
import { getAiringSchedule } from "@/lib/anilist"

async function getUpcoming(): Promise<AniListAiringSchedule[]> {
  try {
    const result = await getAiringSchedule()
    return result?.Page?.airingSchedules ?? []
  } catch {
    return []
  }
}

function groupByDate(schedules: AniListAiringSchedule[]): Record<string, AniListAiringSchedule[]> {
  const groups: Record<string, AniListAiringSchedule[]> = {}
  for (const s of schedules) {
    const date = new Date(s.airingAt * 1000).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(s)
  }
  return groups
}

export default async function UpcomingPage() {
  const schedules = await getUpcoming()
  const grouped = groupByDate(schedules)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Calendar className="h-7 w-7 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Upcoming Episodes</h1>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No upcoming episodes found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                {date}
              </h2>
              <div className="space-y-2">
                {items.map((item) => {
                  const title =
                    item.media.title.english ?? item.media.title.romaji ?? "Unknown"
                  const cover =
                    item.media.coverImage.large ?? item.media.coverImage.medium

                  return (
                    <Link
                      key={item.id}
                      href={`/anime/${item.media.id}`}
                      className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-all group"
                    >
                      <div className="relative h-14 w-10 overflow-hidden rounded bg-muted shrink-0">
                        {cover ? (
                          <Image src={cover} alt={title} fill className="object-cover" />
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {title}
                        </p>
                        <AiringCountdown
                          episode={item.episode}
                          airingAt={item.airingAt}
                        />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
