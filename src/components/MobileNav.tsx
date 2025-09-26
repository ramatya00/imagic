"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";
import UserProfile from "./UserProfile";
import { useNav } from "./NavContext";
import Logo from "./Logo";
import { Menu } from "lucide-react";

export default function MobileNav() {
	const [showDropdown, setShowDropdown] = useState(false);
	const { navLinks, isActive, user } = useNav();

	const toggleDropdown = () => setShowDropdown((prev) => !prev);
	const closeDropdown = () => setShowDropdown(false);

	return (
		<nav className="flex justify-between items-center">
			<Link href="/" className="w-12">
				<Logo />
			</Link>

			<Menu width={28} height={28} onClick={toggleDropdown} className="cursor-pointer" />

			<div
				className={cn(
					"absolute bg-base-200 rounded-2xl right-4 top-24 h-[calc(100vh-108px)] w-[calc(100vw-32px)] transition-all ease-in-out duration-300 px-4 py-6 flex flex-col justify-between items-end z-50",
					!showDropdown && "-right-full"
				)}
			>
				<div className="space-y-8">
					{navLinks.map(({ label, href, icon: Icon }) => (
						<Link
							key={href}
							href={href}
							className={cn("flex justify-end font-medium text-lg gap-5", isActive(href) && "text-primary")}
							onClick={closeDropdown}
						>
							<span>{label}</span>
							<Icon className="h-8 w-8" />
						</Link>
					))}
				</div>

				<div className="flex items-center gap-5">
					{user && <span className="font-medium">{user.username}</span>}
					<UserProfile />
				</div>
			</div>
		</nav>
	);
}