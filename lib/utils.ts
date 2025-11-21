 import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse timestamps coming from the DB which may be in different formats.
// Returns a Date object or null if parsing fails.
// Date helpers now live in server/datetime.ts
