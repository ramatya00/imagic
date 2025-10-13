

"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SignOutHandler() {
	const { user } = useClerk();
	const router = useRouter();

	useEffect(() => {
		// This effect will run when the user object changes
		// If user becomes null (signed out), redirect to home
		if (user === null || user === undefined) {
			router.push("/");
			// Force a page refresh to clear all user-specific data
			window.location.reload();
		}
	}, [user, router]);

	// This component doesn't render anything
	return null;
}