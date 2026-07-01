"use client"

import { useState, useRef, useEffect } from "react"
import { format, parse, isValid, isAfter, isBefore, startOfDay } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  label?: string
  value: string          // ISO yyyy-MM-dd or ""
  onChange: (iso: string) => void
  minDate?: Date         // earliest selectable date
  maxDate?: Date         // latest selectable date
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
}

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/
const DMY_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

function isoToDisplay(iso: string): string {
  if (!iso) return ""
  const d = parse(iso, "yyyy-MM-dd", new Date())
  return isValid(d) ? format(d, "dd/MM/yyyy") : ""
}

function displayToIso(dmy: string): string | null {
  const m = dmy.match(DMY_RE)
  if (!m) return null
  const d = parse(`${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`, "yyyy-MM-dd", new Date())
  return isValid(d) ? format(d, "yyyy-MM-dd") : null
}

function isoToDate(iso: string): Date | undefined {
  if (!iso || !ISO_RE.test(iso)) return undefined
  const d = parse(iso, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "dd/mm/yyyy",
  error,
  required,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(isoToDisplay(value))
  const [inputError, setInputError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync text when value prop changes externally
  useEffect(() => {
    setText(isoToDisplay(value))
    setInputError(null)
  }, [value])

  function validateAndCommit(raw: string) {
    const trimmed = raw.trim()
    if (!trimmed) {
      setInputError(required ? "Date is required." : null)
      if (!required) onChange("")
      return
    }

    const iso = displayToIso(trimmed)
    if (!iso) {
      setInputError("Enter a valid date (dd/mm/yyyy).")
      return
    }

    const date = parse(iso, "yyyy-MM-dd", new Date())
    if (minDate && isBefore(date, startOfDay(minDate))) {
      setInputError(`Date cannot be before ${format(minDate, "dd/MM/yyyy")}.`)
      return
    }
    if (maxDate && isAfter(date, startOfDay(maxDate))) {
      setInputError(`Date cannot be after ${format(maxDate, "dd/MM/yyyy")}.`)
      return
    }

    setInputError(null)
    onChange(iso)
    setText(format(date, "dd/MM/yyyy"))
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/[^\d/]/g, "")

    // Auto-insert slashes after day and month digits
    if (/^\d{2}$/.test(raw) && text.length < raw.length) raw += "/"
    else if (/^\d{2}\/\d{2}$/.test(raw) && text.length < raw.length) raw += "/"

    setText(raw)
    setInputError(null)

    if (DMY_RE.test(raw)) validateAndCommit(raw)
    else if (!raw) { onChange(""); setInputError(null) }
  }

  function handleCalendarSelect(date: Date | undefined) {
    if (!date) return
    const iso = format(date, "yyyy-MM-dd")
    onChange(iso)
    setText(format(date, "dd/MM/yyyy"))
    setInputError(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  const showError = inputError ?? error
  const selectedDate = isoToDate(value)

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs font-medium text-muted-foreground">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className={cn(
        "flex items-center rounded-md border bg-background transition-colors",
        showError ? "border-red-500" : "border-border focus-within:border-primary",
        disabled && "opacity-50 pointer-events-none",
      )}>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={text}
          onChange={handleTextChange}
          onBlur={(e) => validateAndCommit(e.target.value)}
          placeholder={placeholder}
          maxLength={10}
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none min-w-0"
        />

        {value && !disabled && (
          <button
            type="button"
            onClick={() => { onChange(""); setText(""); setInputError(null) }}
            className="px-2 text-muted-foreground hover:text-foreground transition-colors"
            tabIndex={-1}
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="px-2.5 py-2 border-l border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors rounded-r-md"
              aria-label="Open calendar"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              defaultMonth={selectedDate ?? (maxDate ? startOfDay(maxDate) : undefined)}
              disabled={(date) =>
                (minDate ? isBefore(date, startOfDay(minDate)) : false) ||
                (maxDate ? isAfter(date, startOfDay(maxDate)) : false)
              }
              autoFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {showError && (
        <p className="text-xs text-red-500">{showError}</p>
      )}
    </div>
  )
}
