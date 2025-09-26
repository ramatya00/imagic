import GenerateForm from "@/components/generate/GenerateForm";
import GenerateImage from "@/components/generate/GenerateImage";


export default function GeneratePage() {
	return (
		<>
			<section>
				<GenerateForm />
			</section>
			<section>
				<GenerateImage />
			</section>
		</>
	);
}