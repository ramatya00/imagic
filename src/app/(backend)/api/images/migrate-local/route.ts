import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// Structure of locally stored image data to be migrated
type LocalImageData = {
  id: string;
  prompt: string;
  negativePrompt?: string | null;
  colorScheme?: string | null;
  orientation: string;
  guidanceScale: number;
  seed?: string | null;
  imageUrl: string;
  storageKey: string;
  createdAt: string;
};

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await req.json();
    const { localImages } = body as { localImages: LocalImageData[] };
    
    if (!Array.isArray(localImages)) {
      return NextResponse.json(
        { error: "Invalid request format, expected localImages array" },
        { status: 400 }
      );
    }
    
    // Migrate each local image to the database
    const migratedImages = await Promise.all(
      localImages.map(async (localImage) => {
        try {
          // Check if this image already exists by storageKey
          const existingImage = await prisma.image.findFirst({
            where: {
              storageKey: localImage.storageKey,
            },
          });
          
          // Skip if already exists
          if (existingImage) {
            return {
              id: existingImage.id,
              status: "skipped",
              message: "Image already exists in database",
            };
          }
          
          // Create the image in the database
          const image = await prisma.image.create({
            data: {
              prompt: localImage.prompt,
              negativePrompt: localImage.negativePrompt,
              colorScheme: localImage.colorScheme,
              orientation: localImage.orientation,
              guidanceScale: localImage.guidanceScale,
              seed: localImage.seed ? BigInt(localImage.seed) : null,
              imageUrl: localImage.imageUrl,
              storageKey: localImage.storageKey,
              createdAt: new Date(localImage.createdAt),
              userId: user.id,
            },
          });
          
          return {
            id: image.id,
            status: "migrated",
            message: "Successfully migrated to database",
          };
        } catch (error) {
          console.error(`Error migrating image ${localImage.id}:`, error);
          return {
            id: localImage.id,
            status: "error",
            message: "Failed to migrate to database",
          };
        }
      })
    );
    
    return NextResponse.json({
      success: true,
      message: "Local images migration completed",
      results: migratedImages,
    });
    
  } catch (error) {
    console.error("Error migrating local images:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to migrate local images" },
      { status: 500 }
    );
  }
}
