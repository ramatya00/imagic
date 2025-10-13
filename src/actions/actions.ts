"use server";

import { prisma } from "../lib/prisma";
import { generateImage } from "../lib/gemini";
import { uploadImageToImageKit } from "../lib/imagekit";
import { GenerateImageInput } from "../lib/validations";
import { GUEST_GENERATION_LIMIT } from "../lib/constants";
import {
  isAuthenticated,
  getGuestGenerationCount,
  setGuestGenerationCount,
} from "./auth";
import {
  getOrCreateUser,
  getOrCreateGuestUser,
  getGuestSessionId,
} from "./data";

type GenerateImageResult = {
  success: boolean;
  url: string;
};

export async function createImage(
  imageData: GenerateImageInput
): Promise<GenerateImageResult> {
  try {
    const authenticated = await isAuthenticated();

    if (authenticated) {
      return await createImageForAuthenticatedUser(imageData);
    } else {
      return await createImageForGuestUser(imageData);
    }
  } catch (error) {
    console.error("Error in createImageWithCreditsOrGuest:", error);

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate and save image");
  }
}

export async function cleanupOldGuestUsers() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  await prisma.user.deleteMany({
    where: {
      clerkId: {
        startsWith: "guest-",
      },
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  });
}

async function createImageForAuthenticatedUser(
  imageData: GenerateImageInput
): Promise<GenerateImageResult> {
  const user = await getOrCreateUser();

  // Validate credits before doing anything
  if (user.credits < 1) {
    throw new Error("Insufficient credits");
  }

  // Generate and upload image
  const imageUrl = await generateAndUploadImage(imageData);

  // Deduct credits and save to database in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        credits: { decrement: 1 },
      },
    });

    await tx.image.create({
      data: {
        userId: user.id,
        url: imageUrl,
        prompt: imageData.prompt,
        negativePrompt: imageData.negativePrompt || "",
        colorScheme: imageData.colorScheme || "",
        aspectRatio: imageData.aspectRatio,
        guidanceScale: imageData.guidanceScale,
      },
    });
  });

  return { success: true, url: imageUrl };
}

async function createImageForGuestUser(
  imageData: GenerateImageInput
): Promise<GenerateImageResult> {
  // Check generation limit
  const guestUsed = await getGuestGenerationCount();

  if (guestUsed >= GUEST_GENERATION_LIMIT) {
    throw new Error("Free generation limit reached. Please sign up for more!");
  }

  // Get or create guest user for this session
  const sessionId = await getGuestSessionId();
  const guestClerkId = `guest-${sessionId}`;
  const guestUser = await getOrCreateGuestUser(guestClerkId);

  // Generate and upload image
  const imageUrl = await generateAndUploadImage(imageData);

  // Save to database
  await prisma.image.create({
    data: {
      userId: guestUser.id,
      url: imageUrl,
      prompt: imageData.prompt,
      negativePrompt: imageData.negativePrompt || "",
      colorScheme: imageData.colorScheme || "",
      aspectRatio: imageData.aspectRatio,
      guidanceScale: imageData.guidanceScale,
    },
  });

  // Increment guest generation count
  await setGuestGenerationCount(guestUsed + 1);

  return { success: true, url: imageUrl };
}

async function generateAndUploadImage(
  imageData: GenerateImageInput
): Promise<string> {
  // Generate the image using Gemini
  const generatedImage = await generateImage(imageData);

  if (!generatedImage.url) {
    throw new Error("Failed to generate image URL");
  }

  // Upload to ImageKit
  const fileName = `generated-${Date.now()}.png`;
  const imageUrl = await uploadImageToImageKit(generatedImage.url, fileName);

  return imageUrl;
}
