import OpenAI from "openai";
import { GenerateImageInput } from "./validations";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
	throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

export async function generateImage({
	prompt,
	negativePrompt,
	colorScheme,
	guidanceScale,
}: GenerateImageInput) {
	try {
		// Construct the full prompt with all parameters
		let fullPrompt = prompt;

		if (colorScheme) {
			fullPrompt += ` Use a ${colorScheme} color scheme.`;
		}

		if (negativePrompt) {
			fullPrompt += ` Avoid: ${negativePrompt}.`;
		}

		// Generate the image using DALL-E 2
		const response = await openai.images.generate({
			model: "dall-e-2",
			prompt: fullPrompt,
			n: 1,
			size: "512x512", // Fixed size for DALL-E 2
			response_format: "b64_json",
		});

		// Extract the base64 image data
		const imageData = response.data?.[0]?.b64_json;

		if (!imageData) {
			throw new Error("No image data received from OpenAI");
		}

		// Create a data URL from the base64 image data
		const dataUrl = `data:image/png;base64,${imageData}`;

		return {
			url: dataUrl,
			negativePrompt: negativePrompt || "",
			colorScheme: colorScheme || "",
			guidanceScale,
			prompt,
		};
	} catch (error) {
		console.error("Error generating image with OpenAI:", error);

		if (error instanceof OpenAI.APIError) {
			if (error.status === 400) {
				throw new Error(`Invalid request: ${error.message}`);
			} else if (error.status === 401) {
				throw new Error("Invalid API key");
			} else if (error.status === 429) {
				throw new Error("Rate limit exceeded. Please try again later.");
			}
		}

		throw new Error("Failed to generate image");
	}
}
