import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

export function formatCalories(calories: number): string {
  return `${Math.round(calories)} cal`
}

export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${weight.toFixed(1)} ${unit}`
}

export function calculateBMI(weight: number, height: number): number {
  // weight in kg, height in cm
  const heightInMeters = height / 100
  return weight / (heightInMeters * heightInMeters)
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}