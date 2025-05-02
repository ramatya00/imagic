import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Optional authentication - feeds are public but we need to know if user has bookmarked images
    const currentUser = await getCurrentUser();
    
    // Get pagination params from URL
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    
    // Validate pagination params
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit));
    const skip = (validPage - 1) * validLimit;
    
    // Build search query
    const whereClause: any = {
      published: true,
    };
    
    if (search) {
      whereClause.OR = [
        { prompt: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Fetch published images
    const [images, totalCount] = await Promise.all([
      prisma.image.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: validLimit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              imageUrl: true,
            },
          },
          bookmarks: currentUser ? {
            where: {
              userId: currentUser.id,
            },
            select: {
              id: true,
            },
          } : undefined,
          _count: {
            select: {
              bookmarks: true,
            },
          },
        },
      }),
      prisma.image.count({
        where: whereClause,
      }),
    ]);
    
    // Transform the data to add isBookmarked flag
    const transformedImages = images.map(image => ({
      ...image,
      isBookmarked: currentUser ? image.bookmarks.length > 0 : false,
      bookmarkCount: image._count.bookmarks,
      bookmarks: undefined,
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
    console.error("Error fetching feeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
