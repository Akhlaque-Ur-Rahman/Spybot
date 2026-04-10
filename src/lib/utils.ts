import { clsx, type ClassValue } from 'clsx';

/** Merge conditional class names (shadcn-style helper without Tailwind). */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
