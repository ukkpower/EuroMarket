import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price (0-1 range) as cents with proper decimal handling.
 * Shows decimals when needed (e.g., 3.2) but omits .0 (e.g., 97 instead of 97.0)
 */
export function formatPrice(price: number): string {
  const cents = price * 100;
  // Round to 1 decimal place to handle floating point precision
  const rounded = Math.round(cents * 10) / 10;
  
  // If it's a whole number, return without decimal
  if (rounded % 1 === 0) {
    return rounded.toString();
  }
  
  // Otherwise, return with 1 decimal place
  return rounded.toFixed(1);
}
