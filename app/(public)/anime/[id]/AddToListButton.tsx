"use client"

import { useState } from "react"
import { List } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddToListModal from "@/components/lists/AddToListModal"

interface AddToListButtonProps {
  animeId: number
  animeTitle: string
  animeCoverUrl?: string | null
}

export default function AddToListButton({ animeId, animeTitle, animeCoverUrl }: AddToListButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}>
        <List className="h-4 w-4" />
        Add to List
      </Button>
      <AddToListModal
        animeId={animeId}
        animeTitle={animeTitle}
        animeCoverUrl={animeCoverUrl}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
