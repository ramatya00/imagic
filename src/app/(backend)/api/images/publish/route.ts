import { NextRequest, NextResponse } from "next/server";
import { publishImageSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = publishImageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { imageId } = validationResult.data;
    
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
    
    // Update image to be published
    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: { published: true },
    });
    
    return NextResponse.json({
      success: true,
      image: updatedImage,
    });
    
  } catch (error) {
    console.error("Error publishing image:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to publish image" },
      { status: 500 }
    );
  }
}
