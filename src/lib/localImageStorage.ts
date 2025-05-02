"use client";

// Type for locally stored images
export type LocalImage = {
	id: string;
	prompt: string;
	negativePrompt?: string | null;
	colorScheme?: string | null;
	orientation: string;
	guidanceScale: number;
	seed?: string | null;
	imageUrl: string;
	storageKey: string; // Needed for later migration to database
	createdAt: string;
};

const LOCAL_STORAGE_KEY = "imagic_local_images";
const LOCAL_USAGE_KEY = "imagic_local_usage";
const MAX_LOCAL_GENERATIONS = 2;

// Get local images from browser storage
export function getLocalImages(): LocalImage[] {
	if (typeof window === "undefined") return [];

	try {
		const storedImages = localStorage.getItem(LOCAL_STORAGE_KEY);
		return storedImages ? JSON.parse(storedImages) : [];
	} catch (error) {
		console.error("Error retrieving local images:", error);
		return [];
	}
}

// Save an image to browser storage
export function saveLocalImage(image: LocalImage): void {
	if (typeof window === "undefined") return;

	try {
		const existingImages = getLocalImages();
		const updatedImages = [image, ...existingImages];
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedImages));

		// Update usage counter
		const currentUsage = getLocalUsage();
		setLocalUsage(currentUsage + 1);
	} catch (error) {
		console.error("Error saving local image:", error);
	}
}

// Remove all local images
export function clearLocalImages(): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.removeItem(LOCAL_STORAGE_KEY);
		localStorage.removeItem(LOCAL_USAGE_KEY);
	} catch (error) {
		console.error("Error clearing local images:", error);
	}
}

// Get current local usage count
export function getLocalUsage(): number {
	if (typeof window === "undefined") return 0;

	try {
		const storedUsage = localStorage.getItem(LOCAL_USAGE_KEY);
		return storedUsage ? parseInt(storedUsage, 10) : 0;
	} catch (error) {
		console.error("Error retrieving local usage:", error);
		return 0;
	}
}

// Set local usage count
export function setLocalUsage(count: number): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(LOCAL_USAGE_KEY, count.toString());
	} catch (error) {
		console.error("Error setting local usage:", error);
	}
}

// Reset local usage (e.g., after daily reset)
export function resetLocalUsage(): void {
	if (typeof window === "undefined") return;

	try {
		localStorage.setItem(LOCAL_USAGE_KEY, "0");
	} catch (error) {
		console.error("Error resetting local usage:", error);
	}
}

// Check if user can generate more images locally
export function canGenerateLocally(): boolean {
	const usage = getLocalUsage();
	return usage < MAX_LOCAL_GENERATIONS;
}

// Get local generation limit status
export function getLocalLimitStatus() {
	const usage = getLocalUsage();
	return {
		usage,
		max: MAX_LOCAL_GENERATIONS,
		canGenerate: usage < MAX_LOCAL_GENERATIONS,
	};
}
