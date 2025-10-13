

"use client";

import { createContext, useContext, ReactNode } from "react";
import { HammerIcon, Layers2Icon, CreditCardIcon, ChartPieIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";

type NavLink = {
	label: string;
	href: string;
	icon: React.ElementType;
};

type NavContextType = {
	navLinks: NavLink[];
	pathname: string;
	isActive: (href: string) => boolean;
	user: ReturnType<typeof useUser>["user"];
};

const NavContext = createContext<NavContextType | null>(null);

export function NavProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const { user, isSignedIn } = useUser();

	const baseNavLinks = [
		{ label: "generate", href: "/generate", icon: HammerIcon },
		{ label: "history", href: user?.id ? `/history/${user.id}` : "/history", icon: Layers2Icon },
		{ label: "pricing", href: "/pricing", icon: ChartPieIcon }
	];

	const navLinks = isSignedIn
		? [...baseNavLinks, { label: "billing", href: "/billing", icon: CreditCardIcon }]
		: baseNavLinks;

	const isActive = (href: string) => pathname === href;

	return <NavContext.Provider value={{ navLinks, pathname, isActive, user }}>{children}</NavContext.Provider>;
}

export function useNav() {
	const context = useContext(NavContext);
	if (!context) {
		throw new Error("useNav must be used within a NavProvider");
	}
	return context;
}