import { notFound } from "next/navigation"
import { BookOpen } from "lucide-react"
import DiaryEntryRow from "@/components/diary/DiaryEntryRow"
import type { DiaryEntry } from "@/lib/types"
import { createClient } from "@/lib/supabase/server"

interface DiaryPageProps {
  params: Promise<{ username: string }>
}

async function getUserDiary(username: string): Promise<DiaryEntry[] | null> {
  try {
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single()

    if (profileError || !profile) return null

    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", profile.id)
      .order("date_completed", { ascending: false, nullsFirst: false })

    if (error) return null

    return data ?? []
  } catch {
    return null
  }
}

export default async function UserDiaryPage({ params }: DiaryPageProps) {
  const { username } = await params
  const entries = await getUserDiary(username)

  if (!entries) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BookOpen className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">
          <span className="text-muted-foreground font-normal">@{username}&apos;s</span> Diary
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No entries yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <DiaryEntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
