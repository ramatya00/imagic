import { NextRequest, NextResponse } from "next/server";
import { generateImageSchema } from "@/lib/validations";
import { generateImage } from "@/lib/gemini";
import { uploadImageToStorage } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { checkAndUpdateUserLimits, incrementUserGenerationCount, getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
	try {
		// Try to get authenticated user (optional)
		const user = await getCurrentUser();
		let isAuthenticated = !!user;
		let limitStatus;

		// Check if authenticated user can generate images
		if (isAuthenticated && user) {
			limitStatus = await checkAndUpdateUserLimits(user.id);
			if (!limitStatus.canGenerate) {
				return NextResponse.json({ error: "Daily generation limit reached", limitStatus, isAuthenticated }, { status: 429 });
			}
		} else {
			// For unauthenticated users, limit is handled client-side
			// Just indicating that we're processing an unauthenticated request
			limitStatus = null;
		}

		// Parse and validate request body
		const body = await req.json();
		const validationResult = generateImageSchema.safeParse(body);

		if (!validationResult.success) {
			return NextResponse.json({ error: "Invalid request", issues: validationResult.error.issues }, { status: 400 });
		}

		const { prompt, negativePrompt, colorScheme, orientation, guidanceScale, seed: customSeed } = validationResult.data;

		// Generate random seed if not provided
		const seed = customSeed || Math.floor(Math.random() * 2147483);

		// Generate image using Gemini API
		const result = await generateImage({
			prompt,
			negativePrompt,
			colorScheme,
			orientation,
			guidanceScale: guidanceScale || 7.5,
			seed,
		});

		if (!result.imageData) {
			return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
		}

		// Generate a unique ID for the image (important for unauthenticated users)
		const uniqueId = uuidv4();
		const storageFolderId = isAuthenticated && user ? user.id : "anonymous";

		// Upload image to Supabase
		const { url, storageKey } = await uploadImageToStorage(result.imageData, storageFolderId);

		let imageRecord;
		let updatedLimitStatus = limitStatus;

		// If user is authenticated, save to database and update limits
		if (isAuthenticated && user) {
			// Increment user's generation count
			await incrementUserGenerationCount(user.id);

			// Save image to database
			imageRecord = await prisma.image.create({
				data: {
					prompt,
					negativePrompt: negativePrompt || null,
					colorScheme: colorScheme || null,
					orientation,
					guidanceScale,
					seed: BigInt(seed),
					imageUrl: url,
					storageKey,
					userId: user.id,
				},
			});

			// Get updated limit status
			updatedLimitStatus = await checkAndUpdateUserLimits(user.id);

			// Convert BigInt to string to make it serializable
			const serializedImage = {
				...imageRecord,
				seed: imageRecord.seed ? imageRecord.seed.toString() : null,
			};

			return NextResponse.json({
				success: true,
				image: serializedImage,
				limitStatus: updatedLimitStatus,
				isAuthenticated,
			});
		} else {
			// For unauthenticated users, return the image data without storing in database
			// Local storage will be handled on the client side
			const localImage = {
				id: uniqueId,
				prompt,
				negativePrompt: negativePrompt || null,
				colorScheme: colorScheme || null,
				orientation,
				guidanceScale,
				seed: seed.toString(),
				imageUrl: url,
				storageKey,
				createdAt: new Date().toISOString(),
			};

			return NextResponse.json({
				success: true,
				image: localImage,
				isAuthenticated,
				limitStatus: null, // No limitStatus for unauthenticated users, it's managed client-side
			});
		}
	} catch (error) {
		console.error("Error generating image:", error);

		// Note: We don't return 401 for unauthenticated users anymore since they're allowed to generate images
		if (error instanceof Error && error.message === "Unauthorized") {
			console.error("Authentication error but continuing as anonymous user");
			// Return a general error here instead of propagating the Unauthorized error
			return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
		}

		return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
	}
}
