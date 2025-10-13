import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/Sidebar";
import { dark } from "@clerk/themes";
import MobileNav from "@/components/MobileNav";
import { NavProvider } from "@/components/NavContext";
import { QueryProvider } from "@/components/QueryProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
	title: "Imagic - AI Image Generation",
	description: "Generate AI images with Imagic",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider
			appearance={{ baseTheme: dark }}
			afterSignOutUrl="/sign-out"
		>
			<html lang="en">
				<body className="antialiased bg-neutral">
					<QueryProvider>
						<NavProvider>
							<div className="flex flex-col md:flex-row max-w-[1440px] mx-auto p-3 md:p-5 gap-4 md:gap-6 h-screen overflow-hidden relative">
								<div className="hidden md:block bg-base-200 h-grow py-6 px-4 rounded-2xl shadow-lg/75 shadow-base-100">
									<Sidebar />
								</div>
								<div className="md:hidden bg-base-200 px-4 py-3 rounded-2xl shadow-xl/75 shadow-base-100">
									<MobileNav />
								</div>
								<main className="grow bg-base-200 rounded-2xl px-4 md:px-8 py-6 shadow-xl/75 shadow-base-100 overflow-y-auto">
									{children}
								</main>
							</div>
						</NavProvider>
					</QueryProvider>
					<Toaster
						position="bottom-right"
						toastOptions={{
							duration: 4000,
							style: {
								background: '#333',
								color: '#fff',
								maxWidth: '500px',
								width: 'fit-content',
								minWidth: '300px',
								padding: '12px 16px',
								fontSize: '14px',
								borderRadius: '8px',
								border: '1px solid #444',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
							},
							success: {
								iconTheme: {
									primary: '#4ade80',
									secondary: '#fff',
								},
							},
							error: {
								iconTheme: {
									primary: '#f87171',
									secondary: '#fff',
								},
							},
						}}
					/>
				</body>
			</html>
		</ClerkProvider>
	);
}