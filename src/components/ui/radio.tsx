"use client"

import { Radio as RadioPrimitive } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"

function Radio({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-full border border-input bg-card text-primary shadow-cc-surface transition-colors duration-cc-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 data-checked:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="size-2.5 rounded-full bg-current" />
    </RadioPrimitive.Root>
  )
}

export { Radio }
