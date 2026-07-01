import Link from "next/link"
import Image from "next/image"
import { List, Lock, Globe } from "lucide-react"
import type { List as ListType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ListCardProps {
  list: ListType
  href?: string
}

export default function ListCard({ list, href }: ListCardProps) {
  const covers = list.preview_covers ?? []
  const linkHref = href ?? `/lists/${list.id}`

  return (
    <Link href={linkHref} className="group block">
      <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5">
        {/* Cover mosaic */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {covers.length >= 4 ? (
            <div className="grid grid-cols-2 h-full">
              {covers.slice(0, 4).map((src, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image src={src} alt="" fill sizes="50vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : covers.length > 0 ? (
            <Image
              src={covers[0]}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <List className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                {list.name}
              </h3>
              {list.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {list.description}
                </p>
              )}
            </div>
            <div className="shrink-0 text-muted-foreground">
              {list.is_public ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span
              className={cn(
                "text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded",
                "bg-primary/10 text-primary"
              )}
            >
              {list.list_type}
            </span>
            <span className="text-xs text-muted-foreground">
              {list.item_count ?? 0} {(list.item_count ?? 0) === 1 ? "anime" : "anime"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
