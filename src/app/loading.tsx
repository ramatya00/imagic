import Loader from "@/components/Loader";

export default function Loading() {
	return (
		<div className="h-full w-full flex justify-center items-center">
			<Loader message="Loading ..." />
		</div>
	)
}