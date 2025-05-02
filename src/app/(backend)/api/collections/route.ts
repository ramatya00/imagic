import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createCollectionSchema, updateCollectionSchema } from "@/lib/validations";

// Get user's collections
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Fetch all collections for the user with counts
    const collections = await prisma.collection.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            images: true,
          },
        },
      },
    });
    
    // Transform data for frontend use
    const transformedCollections = collections.map(collection => ({
      ...collection,
      imageCount: collection._count.images,
      _count: undefined,
    }));
    
    return NextResponse.json({
      collections: transformedCollections,
    });
    
  } catch (error) {
    console.error("Error fetching collections:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

// Create a new collection
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = createCollectionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { name, description } = validationResult.data;
    
    // Create new collection
    const collection = await prisma.collection.create({
      data: {
        name,
        description,
        userId: user.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      collection,
    });
    
  } catch (error) {
    console.error("Error creating collection:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}

// Update an existing collection
export async function PUT(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = updateCollectionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { collectionId, name, description } = validationResult.data;
    
    // Verify collection exists and belongs to the user
    const existingCollection = await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: user.id,
      },
    });
    
    if (!existingCollection) {
      return NextResponse.json(
        { error: "Collection not found or you don't have permission" },
        { status: 404 }
      );
    }
    
    // Update collection
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        name,
        description,
      },
    });
    
    return NextResponse.json({
      success: true,
      collection: updatedCollection,
    });
    
  } catch (error) {
    console.error("Error updating collection:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update collection" },
      { status: 500 }
    );
  }
}
