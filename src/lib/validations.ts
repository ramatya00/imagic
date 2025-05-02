import { z } from "zod";

// Valid color schemes from utils.ts
export const colorSchemes = ["", "Neon", "Warm", "Monochrome", "Vibrant", "Cool", "Pastel", "Dark", "Bright", "Muted"] as const;

// Valid orientations
export const orientations = ["landscape 1920x1080", "portrait 512x1024", "square 1024x1024"] as const;

// Image generation schema
export const generateImageSchema = z.object({
	prompt: z.string().min(3, "Prompt must be at least 3 characters").max(500, "Prompt is too long"),
	negativePrompt: z.string().max(500, "Negative prompt is too long").optional(),
	colorScheme: z.enum(colorSchemes).optional(),
	orientation: z.enum(orientations),
	guidanceScale: z.number().min(0).max(10),
	seed: z.number().int().optional(),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

// Image publishing schema
export const publishImageSchema = z.object({
	imageId: z.string().min(1),
});

export type PublishImageInput = z.infer<typeof publishImageSchema>;

// Delete image schema
export const deleteImageSchema = z.object({
	imageId: z.string().min(1),
});

export type DeleteImageInput = z.infer<typeof deleteImageSchema>;

// Bookmark image schema
export const bookmarkImageSchema = z.object({
	imageId: z.string().min(1),
});

export type BookmarkImageInput = z.infer<typeof bookmarkImageSchema>;

// Remove bookmark schema
export const removeBookmarkSchema = z.object({
	imageId: z.string().min(1),
});

export type RemoveBookmarkInput = z.infer<typeof removeBookmarkSchema>;

// Create collection schema
export const createCollectionSchema = z.object({
	name: z.string().min(1, "Name is required").max(50, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

// Update collection schema
export const updateCollectionSchema = z.object({
	collectionId: z.string().min(1),
	name: z.string().min(1, "Name is required").max(50, "Name is too long"),
	description: z.string().max(500, "Description is too long").optional(),
});

export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;

// Delete collection schema
export const deleteCollectionSchema = z.object({
	collectionId: z.string().min(1),
});

export type DeleteCollectionInput = z.infer<typeof deleteCollectionSchema>;

// Add image to collection schema
export const addToCollectionSchema = z.object({
	imageId: z.string().min(1),
	collectionId: z.string().min(1),
});

export type AddToCollectionInput = z.infer<typeof addToCollectionSchema>;

// Remove image from collection schema
export const removeFromCollectionSchema = z.object({
	imageId: z.string().min(1),
	collectionId: z.string().min(1),
});

export type RemoveFromCollectionInput = z.infer<typeof removeFromCollectionSchema>;

// Search images schema
export const searchImagesSchema = z.object({
	query: z.string().min(1).max(100),
	page: z.number().int().min(1).default(1),
	limit: z.number().int().min(1).max(50).default(20),
});

export type SearchImagesInput = z.infer<typeof searchImagesSchema>;
