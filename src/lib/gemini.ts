import { GoogleGenAI, HarmBlockThreshold, HarmCategory, Modality } from "@google/genai";
import { GenerateImageInput } from "./validations";

const geminiApiKey = process.env.GEMINI_API_KEY;
const genai = new GoogleGenAI({ apiKey: geminiApiKey });

export async function generateImage({ prompt, negativePrompt, colorScheme, aspectRatio, guidanceScale }: GenerateImageInput) {
	try {
		// Construct the full prompt with all parameters
		let fullPrompt = `Always generate a high quality and high resolution image based on this description: ${prompt}.`;
		if (negativePrompt) fullPrompt += ` Avoid including: ${negativePrompt}.`;
		if (colorScheme) fullPrompt += ` Use a ${colorScheme} color scheme.`;
		fullPrompt += ` The image aspect ratio must be: ${aspectRatio}.`;
		fullPrompt += ` With guidance scale ${guidanceScale} of 10.`;

		// Generate the image
		const response = await genai.models.generateContent({
			model: "gemini-2.0-flash-preview-image-generation",
			config: {
				safetySettings: [
					{
						category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_HARASSMENT,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					},
					{
						category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY,
						threshold: HarmBlockThreshold.BLOCK_NONE,
					}
				],
				responseModalities: [Modality.TEXT, Modality.IMAGE],
			},
			contents: fullPrompt,
		});

		// Process the response
		const result = { text: "", imageData: "", mimeType: "" };

		// Extract text and image data from the response
		if (response.candidates && response.candidates.length > 0) {
			const parts = response.candidates[0].content?.parts || [];
			for (const part of parts) {
				if (part.text) {
					result.text += part.text;
				} else if (part.inlineData) {
					result.imageData = part.inlineData.data || "";
					result.mimeType = part.inlineData.mimeType || "image/png";
				}
			}
		}

		// Check if we have image data
		if (!result.imageData) {
			throw new Error("No image data received from Gemini");
		}

		// Create a data URL from the base64 image data
		const dataUrl = `data:${result.mimeType};base64,${result.imageData}`;

		return {
			url: dataUrl,
			negativePrompt: negativePrompt || "",
			colorScheme: colorScheme || "",
			aspectRatio: aspectRatio || "",
			guidanceScale,
			prompt
		};
	} catch (error) {
		console.error("Error generating image:", error);
		throw new Error("Failed to generate image");
	}
}