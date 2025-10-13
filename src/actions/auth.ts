"use server";

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import {
  GUEST_GENERATION_LIMIT,
  GUEST_COOKIE_NAME,
  COOKIE_MAX_AGE,
} from "../lib/constants";
import { getOrCreateUser } from "./data";

export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}
export async function getGuestGenerationCount(): Promise<number> {
  const cookieStore = await cookies();
  const guestCount = cookieStore.get(GUEST_COOKIE_NAME);
  return guestCount ? parseInt(guestCount.value) : 0;
}

export async function setGuestGenerationCount(count: number) {
  const cookieStore = await cookies();
  cookieStore.set(GUEST_COOKIE_NAME, count.toString(), {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function canGenerate(): Promise<{
  allowed: boolean;
  isGuest: boolean;
  remaining: number;
  message?: string;
}> {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    try {
      const user = await getOrCreateUser();
      return {
        allowed: user.credits > 0,
        isGuest: false,
        remaining: user.credits,
        message:
          user.credits === 0
            ? "No credits remaining. Please purchase more."
            : undefined,
      };
    } catch {
      return {
        allowed: false,
        isGuest: false,
        remaining: 0,
        message: "Authentication required",
      };
    }
  } else {
    const guestUsed = await getGuestGenerationCount();
    const remaining = GUEST_GENERATION_LIMIT - guestUsed;

    return {
      allowed: remaining > 0,
      isGuest: true,
      remaining: remaining,
      message:
        remaining === 0 ? "Free generation used. Sign up for more!" : undefined,
    };
  }
}
