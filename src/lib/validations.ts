import { z } from "zod";

export const colorSchemes = [
	"",
	"Minimalist",
	"Muted",
	"Pastel",
	"Monochrome",
	"Dark",
	"Bright",
	"Earthy",
	"Vibrant",
	"Cool",
	"Warm",
	"Analogous",
	"Complementary",
	"Triadic",
	"Gradient",
	"Neon",
] as const;

export const generateImageSchema = z.object({
	prompt: z
		.string()
		.min(3, "Prompt must be at least 3 characters")
		.max(500, "Prompt is too long"),
	negativePrompt: z
		.string()
		.max(500, "Negative prompt is too long")
		.optional(),
	colorScheme: z.enum(colorSchemes).optional(),
	guidanceScale: z.number().min(0).max(10),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;
