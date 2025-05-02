export default function Loading() {
	return (
		<div className="flex items-center justify-center h-full">
			<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-zinc-400" />
			<p className="ml-4 text-zinc-400">Loading</p>
		</div>
	);
}
