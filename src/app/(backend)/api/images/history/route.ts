import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

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
    
    // Fetch user's generation history
    const [images, totalCount] = await Promise.all([
      prisma.image.findMany({
        where: {
          userId: user.id,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: validLimit,
        include: {
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
      }),
      prisma.image.count({
        where: {
          userId: user.id,
        },
      }),
    ]);
    
    // Transform the data to add bookmark count
    const transformedImages = images.map(image => ({
      ...image,
      bookmarkCount: image._count.bookmarks,
      _count: undefined,
    }));
    
    return NextResponse.json({
      images: transformedImages,
      pagination: {
        page: validPage,
        limit: validLimit,
        totalPages: Math.ceil(totalCount / validLimit),
        totalCount,
      },
    });
    
  } catch (error) {
    console.error("Error fetching history:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 }
    );
  }
}
