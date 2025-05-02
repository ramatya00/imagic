import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteCollectionSchema } from "@/lib/validations";

export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Get collection ID from URL search params
    const { searchParams } = new URL(req.url);
    const collectionId = searchParams.get("collectionId");
    
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }
    
    // Validate the collection ID
    const validationResult = deleteCollectionSchema.safeParse({ collectionId });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid collection ID" },
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
    
    // Delete the collection (this will also delete CollectionImage join records due to cascade)
    await prisma.collection.delete({
      where: { id: collectionId },
    });
    
    return NextResponse.json({
      success: true,
      message: "Collection deleted successfully",
    });
    
  } catch (error) {
    console.error("Error deleting collection:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
