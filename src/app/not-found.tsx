export default function notFound() {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="space-y-2">
				<h1 className="text-xl text-zinc-200 font-semibold">404 - Page Not Found</h1>
				<p className="text-zinc-400">Sorry, the page you are looking for does not exist.</p>
			</div>
		</div>
	);
}
