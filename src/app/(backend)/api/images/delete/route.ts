import { NextRequest, NextResponse } from "next/server";
import { deleteImageSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { deleteImageFromStorage } from "@/lib/supabase";

export async function DELETE(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Get image ID from URL search params
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");
    
    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }
    
    // Validate the image ID
    const validationResult = deleteImageSchema.safeParse({ imageId });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      );
    }
    
    // Verify image exists and belongs to the user
    const image = await prisma.image.findFirst({
      where: {
        id: imageId,
        userId: user.id,
      },
    });
    
    if (!image) {
      return NextResponse.json(
        { error: "Image not found or you don't have permission" },
        { status: 404 }
      );
    }
    
    // Delete the image from storage
    await deleteImageFromStorage(image.storageKey);
    
    // Delete the image from the database
    await prisma.image.delete({
      where: { id: imageId },
    });
    
    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
    
  } catch (error) {
    console.error("Error deleting image:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
