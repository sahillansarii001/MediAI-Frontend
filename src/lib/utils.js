import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDoctorName(name) {
  if (!name || typeof name !== 'string') return 'Doctor';
  const trimmed = name.trim();
  if (/^dr\.?\s+/i.test(trimmed)) {
    // If it starts with Dr. or Dr (case-insensitive), normalize to "Dr. <Rest>"
    return trimmed.replace(/^dr\.?\s+/i, 'Dr. ');
  }
  return `Dr. ${trimmed}`;
}
