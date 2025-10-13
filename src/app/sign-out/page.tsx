"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/Loader";

export default function SignOutPage() {
	const { signOut } = useClerk();
	const router = useRouter();

	useEffect(() => {
		const handleSignOut = async () => {
			await signOut();
			// Redirect to home after sign out is complete
			router.push("/");
		};

		handleSignOut();
	}, [signOut, router]);

	return (
		<div className="flex flex-col items-center justify-center h-full">
			<Loader message="Signing you out..." />
		</div>
	);
}