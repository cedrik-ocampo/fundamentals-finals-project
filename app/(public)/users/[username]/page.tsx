import { notFound } from "next/navigation"
import Link from "next/link"
import ProfileHeader from "@/components/profile/ProfileHeader"
import ActivityItem from "@/components/social/ActivityItem"
import DiaryEntryRow from "@/components/diary/DiaryEntryRow"
import { createClient } from "@/lib/supabase/server"
import type { Profile, ProfileStats, Activity, DiaryEntry } from "@/lib/types"

interface UserPageProps {
  params: Promise<{ username: string }>
}

async function getUserData(username: string) {
  const supabase = await createClient()

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single()

  if (profileError || !profile) return null

  const {
    data: { user: viewer },
  } = await supabase.auth.getUser()

  const [
    { count: diaryCount },
    { count: reviewCount },
    { count: listCount },
    { count: followersCount },
    { count: followingCount },
    { data: recentActivity },
    { data: recentDiary },
    { data: followRow },
  ] = await Promise.all([
    supabase
      .from("diary_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("lists")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("follows")
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", profile.id),
    supabase
      .from("follows")
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", profile.id),
    supabase
      .from("activity")
      .select("*, profiles(*)")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("diary_entries")
      .select("*")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(5),
    viewer
      ? supabase
          .from("follows")
          .select("follower_id")
          .match({ follower_id: viewer.id, following_id: profile.id })
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return {
    profile: profile as Profile,
    stats: {
      watched_count: diaryCount ?? 0,
      review_count: reviewCount ?? 0,
      list_count: listCount ?? 0,
      followers_count: followersCount ?? 0,
      following_count: followingCount ?? 0,
    } as ProfileStats,
    recentActivity: (recentActivity ?? []) as Activity[],
    recentDiary: (recentDiary ?? []) as DiaryEntry[],
    isFollowing: !!followRow,
  }
}

export default async function UserProfilePage({ params }: UserPageProps) {
  const { username } = await params
  const userData = await getUserData(username)

  if (!userData) notFound()

  const { profile, stats, recentActivity, recentDiary, isFollowing } = userData

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Determine if viewing own profile
  let isOwnProfile = false
  if (user) {
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single()
    isOwnProfile = myProfile?.username === username
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      <ProfileHeader
        profile={profile}
        stats={stats}
        isOwnProfile={isOwnProfile}
        initialFollowing={isFollowing}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          </div>
          <div className="space-y-3">
            {(recentActivity ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No activity yet.</p>
            ) : (
              (recentActivity ?? []).map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
        </div>

        {/* Recent Diary */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground">Recent Watches</h2>
            <Link
              href={`/users/${username}/diary`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {(recentDiary ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No diary entries yet.</p>
            ) : (
              (recentDiary ?? []).map((entry) => (
                <DiaryEntryRow key={entry.id} entry={entry} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
