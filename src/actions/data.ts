"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";

// Get or create authenticated user
export async function getOrCreateUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        credits: 5,
      },
    });
  }

  return user;
}

export async function getCurrentUserClerkId(): Promise<string> {
  const { userId } = await auth();

  if (userId) {
    return userId;
  } else {
    const sessionId = await getGuestSessionId();
    return `guest-${sessionId}`;
  }
}

export async function getGuestSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get("guest_session_id")?.value;

  if (!sessionId) {
    // Create a new session ID
    sessionId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    cookieStore.set("guest_session_id", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return sessionId;
}

export async function getOrCreateGuestUser(guestClerkId: string) {
  let guestUser = await prisma.user.findFirst({
    where: { clerkId: guestClerkId },
  });

  if (!guestUser) {
    guestUser = await prisma.user.create({
      data: {
        clerkId: guestClerkId,
        credits: 2,
      },
    });
  }

  return guestUser;
}

export async function getLatestImage() {
  const clerkId = await getCurrentUserClerkId();

  const latestImage = await prisma.image.findFirst({
    where: {
      user: {
        clerkId: clerkId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return latestImage;
}

export async function getUserImages(limit: number = 10) {
  const clerkId = await getCurrentUserClerkId();

  const images = await prisma.image.findMany({
    where: {
      user: {
        clerkId: clerkId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return images;
}
