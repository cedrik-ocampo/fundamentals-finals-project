"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import CreateListModal from "@/components/lists/CreateListModal"
import type { List } from "@/lib/types"

interface CreateListButtonProps {
  onCreated?: (list: List) => void
}

export default function CreateListButton({ onCreated }: CreateListButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create List
      </Button>
      <CreateListModal
        open={open}
        onClose={() => setOpen(false)}
        onCreated={(list) => {
          setOpen(false)
          onCreated?.(list)
        }}
      />
    </>
  )
}
