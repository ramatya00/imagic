import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import { dark } from "@clerk/themes";
import MobileNav from "@/components/MobileNav";
import { NavProvider } from "@/components/NavContext";

export const metadata: Metadata = {
	title: "Imagen - AI Image Generation",
	description: "Generate and share AI images with Imagen",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider appearance={{ baseTheme: dark }}>
			<html lang="en">
				<body className="antialiased bg-neutral">
					<NavProvider>
						<div className="flex flex-col md:flex-row max-w-[1440px] mx-auto p-3 md:p-5 gap-4 md:gap-6 h-screen overflow-hidden relative">
							<div className="hidden md:block bg-base-200 h-grow py-6 px-4 rounded-2xl shadow-lg/75 shadow-base-100">
								<Sidebar />
							</div>
							<div className="md:hidden bg-base-200 px-4 py-3 rounded-2xl shadow-xl/75 shadow-base-100">
								<MobileNav />
							</div>
							<main className="grow bg-base-200 rounded-2xl px-4 md:px-15 py-10 shadow-xl/75 shadow-base-100 overflow-scroll">{children}</main>
						</div>
					</NavProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}