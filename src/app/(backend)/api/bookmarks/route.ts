import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { bookmarkImageSchema, removeBookmarkSchema } from "@/lib/validations";

// Get user's bookmarked images
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Get pagination params from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    
    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;
    
    // Fetch user's bookmarked images
    const [bookmarks, totalCount] = await Promise.all([
      prisma.bookmark.findMany({
        where: {
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
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
      prisma.bookmark.count({
        where: {
          userId: user.id,
        },
      }),
    ]);
    
    // Transform the data for frontend use
    const images = bookmarks.map(bookmark => ({
      ...bookmark.image,
      isBookmarked: true,
      bookmarkId: bookmark.id,
    }));
    
    return NextResponse.json({
      images,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(totalCount / validLimit),
        totalCount,
      },
    });
    
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// Add a bookmark
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const user = await requireAuth();
    
    // Parse and validate request body
    const body = await req.json();
    const validationResult = bookmarkImageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const { imageId } = validationResult.data;
    
    // Check if image exists
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });
    
    if (!image) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }
    
    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        imageId,
      },
    });
    
    if (existingBookmark) {
      return NextResponse.json(
        { error: "Image already bookmarked", bookmark: existingBookmark },
        { status: 409 }
      );
    }
    
    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        imageId,
      },
    });
    
    return NextResponse.json({
      success: true,
      bookmark,
    });
    
  } catch (error) {
    console.error("Error creating bookmark:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}

// Remove a bookmark
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
    const validationResult = removeBookmarkSchema.safeParse({ imageId });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid image ID" },
        { status: 400 }
      );
    }
    
    // Find and delete the bookmark
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: user.id,
        imageId,
      },
    });
    
    if (!bookmark) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }
    
    await prisma.bookmark.delete({
      where: { id: bookmark.id },
    });
    
    return NextResponse.json({
      success: true,
      message: "Bookmark removed successfully",
    });
    
  } catch (error) {
    console.error("Error removing bookmark:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to remove bookmark" },
      { status: 500 }
    );
  }
}
