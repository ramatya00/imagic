import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { addToCollectionSchema, removeFromCollectionSchema } from "@/lib/validations";

// Get images in a collection
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    const collectionId = params.id;
    
    // Get pagination params from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;
    
    // Verify collection exists and belongs to the user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: user.id,
      },
    });
    
    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found or you don't have permission" },
        { status: 404 }
      );
    }
    
    // Fetch images in the collection
    const [collectionImages, totalCount] = await Promise.all([
      prisma.collectionImage.findMany({
        where: {
          collectionId,
        },
        orderBy: { addedAt: "desc" },
        skip,
        take: validLimit,
        include: {
          image: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.collectionImage.count({
        where: {
          collectionId,
        },
      }),
    ]);
    
    // Transform data for frontend use
    const images = collectionImages.map(item => ({
      ...item.image,
      collectionImageId: item.id,
      addedAt: item.addedAt,
    }));
    
    return NextResponse.json({
      collection,
      images,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(totalCount / validLimit),
        totalCount,
      },
    });
    
  } catch (error) {
    console.error("Error fetching collection images:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch collection images" },
      { status: 500 }
    );
  }
}

// Add image to collection
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    const collectionId = params.id;
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = addToCollectionSchema.safeParse({
      ...body,
      collectionId,
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { imageId } = validationResult.data;
    
    // Verify collection exists and belongs to the user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: user.id,
      },
    });
    
    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found or you don't have permission" },
        { status: 404 }
      );
    }
    
    // Verify image exists
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });
    
    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }
    
    // Check if image is already in collection
    const existingEntry = await prisma.collectionImage.findFirst({
      where: {
        collectionId,
        imageId,
      },
    });
    
    if (existingEntry) {
      return NextResponse.json(
        { error: "Image already in collection", collectionImage: existingEntry },
        { status: 409 }
      );
    }
    
    // Add image to collection
    const collectionImage = await prisma.collectionImage.create({
      data: {
        collectionId,
        imageId,
      },
    });
    
    return NextResponse.json({
      success: true,
      collectionImage,
    });
    
  } catch (error) {
    console.error("Error adding image to collection:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to add image to collection" },
      { status: 500 }
    );
  }
}

// Remove image from collection
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    const collectionId = params.id;
    
    // Get image ID from URL search params
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");
    
    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }
    
    // Validate the request
    const validationResult = removeFromCollectionSchema.safeParse({
      imageId,
      collectionId,
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    // Verify collection exists and belongs to the user
    const collection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: user.id,
      },
    });
    
    if (!collection) {
      return NextResponse.json(
        { error: "Collection not found or you don't have permission" },
        { status: 404 }
      );
    }
    
    // Find the collection image entry
    const collectionImage = await prisma.collectionImage.findFirst({
      where: {
        collectionId,
        imageId,
      },
    });
    
    if (!collectionImage) {
      return NextResponse.json(
        { error: "Image not found in collection" },
        { status: 404 }
      );
    }
    
    // Remove image from collection
    await prisma.collectionImage.delete({
      where: { id: collectionImage.id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Image removed from collection successfully",
    });
    
  } catch (error) {
    console.error("Error removing image from collection:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to remove image from collection" },
      { status: 500 }
    );
  }
}
