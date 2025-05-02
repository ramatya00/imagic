import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImageToStorage(imageData: string, userId: string, uniqueId?: string) {
	try {
		// Extract base64 data - remove prefix if it exists
		const base64Data = imageData.includes("base64,") ? imageData.split("base64,")[1] : imageData;

		// Convert base64 to buffer
		const buffer = Buffer.from(base64Data, "base64");

		// Generate filename with unique ID if provided
		const timestamp = Date.now();
		const finalFilename = uniqueId ? 
			`${userId}_${uniqueId}.png` : 
			`${userId}_${timestamp}.png`;
		const storagePath = `images/${finalFilename}`;

		// Upload to Supabase Storage
		const { data, error } = await supabase.storage.from("ai-images").upload(storagePath, buffer, {
			contentType: "image/png",
			upsert: false,
		});

		if (error) {
			console.error("Storage upload error:", error);
			throw new Error("Failed to upload image to storage");
		}

		// Create signed URL (valid for 1 hour)
		const { data: signedUrlData, error: signedUrlError } =
			await supabase.storage
				.from("ai-images")
				.createSignedUrl(storagePath, 60 * 60);
		if (signedUrlError || !signedUrlData?.signedUrl) {
			console.error("Signed URL error:", signedUrlError);
			throw new Error("Failed to create signed URL");
		}

		return {
			url: signedUrlData.signedUrl,
			storageKey: storagePath,
		};
	} catch (error) {
		console.error("Image upload error:", error);
		throw new Error("Failed to upload image");
	}
}

export async function deleteImageFromStorage(storageKey: string) {
	try {
		const { error } = await supabase.storage.from("ai-images").remove([storageKey]);

		if (error) {
			console.error("Storage delete error:", error);
			throw new Error("Failed to delete image from storage");
		}

		return true;
	} catch (error) {
		console.error("Image delete error:", error);
		throw new Error("Failed to delete image");
	}
}
