import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vehicle status constants
export const VEHICLE_STATUS = {
  OFFLINE: 0,
  ONLINE: 1,
  ONLINE_BUSY: 1,
  ONLINE_AVAILABLE: 2,
} as const

export const calculateDuration = (entryTime: String) => {
  const entry = new Date(entryTime as string)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - entry.getTime()) / 60000)
  return diffInMinutes
}