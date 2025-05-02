import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentUser() {
	const { userId } = await auth();

	if (!userId) {
		return null;
	}

	const user = await prisma.user.findFirst({
		where: {
			clerkId: userId,
		},
	});

	return user;
}

export async function requireAuth() {
	const user = await getCurrentUser();

	if (!user) {
		throw new Error("Unauthorized");
	}

	return user;
}

// Check if the user is authenticated
export async function isAuthenticated() {
  const { userId } = await auth();
  return !!userId;
}

// Check user generation limits and handle daily reset
export async function checkAndUpdateUserLimits(userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!user) throw new Error("User not found");

	// If limitResetAt is in the past or null, reset the limits
	const now = new Date();
	if (!user.limitResetAt || user.limitResetAt < now) {
		// Set next reset time to midnight tonight
		const resetAt = new Date();
		resetAt.setHours(24, 0, 0, 0);

		await prisma.user.update({
			where: { id: userId },
			data: {
				limitUsage: 0,
				limitResetAt: resetAt,
			},
		});

		return { usage: 0, max: user.limitMax, canGenerate: true };
	}

	// Return current limit status
	const canGenerate = user.limitUsage < user.limitMax;
	return {
		usage: user.limitUsage,
		max: user.limitMax,
		canGenerate,
	};
}

// Increment user generation count
export async function incrementUserGenerationCount(userId: string) {
	return prisma.user.update({
		where: { id: userId },
		data: {
			limitUsage: {
				increment: 1,
			},
		},
	});
}
