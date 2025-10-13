export default function Loader({ message }: { message?: string }) {
	return (
		<div className="flex flex-col items-center justify-center text-neutral-400 font-medium">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neutral-400 mb-4" />
			{message && <p>{message}</p>}
		</div>
	)
}