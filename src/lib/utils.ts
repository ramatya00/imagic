import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const colorScheme = ["Neon", "Warm", "Monochrome", "Vibrant", "Cool", "Pastel", "Dark", "Bright", "Muted"];
