"use client";

import UserProfile from "./UserProfile";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNav } from "./NavContext";
import Logo from "./Logo";

export default function Sidebar() {
	const { navLinks, isActive } = useNav();

	return (
		<nav className="flex h-full flex-col justify-between items-center text-end">
			<div className="flex flex-col gap-7 items-center">
				<Link href="/" className="w-13">
					<Logo />
				</Link>
				<div className="h-1 w-full bg-neutral rounded" />
				<ul className="flex flex-col items-center gap-5">
					{navLinks.map(({ label, href, icon: Icon }) => (
						<Link
							key={label}
							href={href}
							className={cn("p-3 rounded-lg hover:bg-neutral", isActive(href) ? "bg-neutral" : "bg-neutral/30")}
							title={label}
						>
							<Icon height={30} width={30} className={isActive(href) ? "text-primary" : "text-zinc-300"} />
						</Link>
					))}
				</ul>
			</div>
			<UserProfile />
		</nav>
	);
}