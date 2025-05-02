import { GoogleGenAI, Modality } from "@google/genai";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genai = new GoogleGenAI({ apiKey: geminiApiKey });

type GenerateImageParams = {
	prompt: string;
	negativePrompt?: string;
	colorScheme?: string;
	orientation: string;
	guidanceScale: number;
	seed: number;
};

export async function generateImage({ prompt, negativePrompt, colorScheme, orientation, guidanceScale, seed }: GenerateImageParams) {
	try {
		// Construct the full prompt with all parameters
		let fullPrompt = `Generate a high-quality image based on this description: ${prompt}.`;
		if (negativePrompt) fullPrompt += ` Avoid including: ${negativePrompt}.`;
		if (colorScheme) fullPrompt += ` Use a ${colorScheme} color scheme.`;
		fullPrompt += ` The image orientation must be: ${orientation}`;
		fullPrompt += ` Guidance scale: ${guidanceScale}.`;
		if (seed) fullPrompt += ` Seed: ${seed}.`;

		// Generate the image
		const response = await genai.models.generateContent({
			model: "gemini-2.0-flash-exp-image-generation",
			contents: fullPrompt,
			config: {
				responseModalities: [Modality.TEXT, Modality.IMAGE],
			},
		});

		// Process the response
		const result = { text: "", imageData: "" };

		// Extract text and image data from the response
		if (response.candidates && response.candidates.length > 0) {
			const parts = response.candidates[0].content?.parts || [];
			for (const part of parts) {
				if (part.text) {
					result.text += part.text;
				} else if (part.inlineData) {
					result.imageData = part.inlineData?.data || "";
				}
			}
		}

		console.log("Generation result:", result.imageData);
		return result;
	} catch (error) {
		console.error("Error generating image:", error);
		throw new Error("Failed to generate image");
	}
}
