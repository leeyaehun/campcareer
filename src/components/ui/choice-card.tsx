"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ChoiceCardProps {
  label: string
  selected: boolean
  onSelect: () => void
  /** Optional left slot — emoji, flag, or icon node. */
  icon?: React.ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Full-width option card for a deliberate single selection. Framer Motion only
 * animates the selection checkmark and respects reduced-motion preferences.
 */
export function ChoiceCard({
  label,
  selected,
  onSelect,
  icon,
  disabled = false,
  className,
}: ChoiceCardProps) {
  const reduce = useReducedMotion()

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-4 rounded-cc-large border px-5 text-left shadow-cc-surface transition-colors duration-cc-fast",
        "min-h-[72px] md:min-h-[88px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2",
        "disabled:opacity-60 disabled:pointer-events-none",
        selected
          ? "border-brand bg-brand-tint"
          : "border-campcareer-border bg-campcareer-surface hover:border-brand/40 hover:bg-secondary",
        className
      )}
    >
      {icon != null && (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center text-2xl leading-none">
          {icon}
        </span>
      )}

      <span
        className={cn(
          "flex-1 text-lg font-medium leading-snug tracking-[-0.01em] md:text-xl",
          selected ? "text-brand font-semibold" : "text-campcareer-ink-secondary"
        )}
      >
        {label}
      </span>

      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        {selected && (
          <motion.span
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.15, ease: "easeOut" }}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-brand-foreground"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
          </motion.span>
        )}
      </span>
    </button>
  )
}
