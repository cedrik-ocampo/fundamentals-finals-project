"use client"

import { useState } from "react"
import { List } from "lucide-react"
import ListCard from "@/components/lists/ListCard"
import CreateListButton from "./CreateListButton"
import type { List as ListType } from "@/lib/types"

interface ListsClientProps {
  initialLists: ListType[]
}

export default function ListsClient({ initialLists }: ListsClientProps) {
  const [lists, setLists] = useState<ListType[]>(initialLists)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <List className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Lists</h1>
        </div>
        <CreateListButton onCreated={(list) => setLists((prev) => [list, ...prev])} />
      </div>

      {lists.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <List className="h-16 w-16 text-muted-foreground/20 mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">No lists yet</h2>
          <p className="text-sm text-muted-foreground">Create a list to organize your anime.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  )
}
