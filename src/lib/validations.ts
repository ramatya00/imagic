import { z } from "zod";

export const colorSchemes = ["", "Neon", "Warm", "Monochrome", "Vibrant", "Cool", "Pastel", "Dark", "Bright", "Muted"] as const;
export const aspectRatio = ["16:9", "9:16", "1:1", "4:3", "3:2", "21:9"] as const;
export const generateImageSchema = z.object({
	prompt: z.string().min(3, "Prompt must be at least 3 characters").max(500, "Prompt is too long"),
	negativePrompt: z.string().max(500, "Negative prompt is too long").optional(),
	colorScheme: z.enum(colorSchemes).optional(),
	aspectRatio: z.enum(aspectRatio),
	guidanceScale: z.number().min(0).max(10),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;