"use client";

import { colorSchemes, GenerateImageInput, generateImageSchema, orientations } from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export default function GenerateForm() {
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<GenerateImageInput>({
		resolver: zodResolver(generateImageSchema),
		defaultValues: {
			guidanceScale: 5,
			seed: Math.floor(Math.random() * 2147483),
		},
	});
	return (
		<form>
			<div className="flex flex-wrap gap-5 md:gap-16">
				<div className="w-full md:w-2/3 space-y-5">
					<div className="flex flex-col gap-2">
						<label htmlFor="prompt" className="label text-xs font-semibold ml-0.5">
							Prompt
						</label>
						<textarea id="prompt" placeholder="Enter the prompt" className="textarea w-full text-sm" rows={8} {...register("prompt")} />
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="negativePrompt" className="label text-xs font-semibold ml-0.5">
							Negative Prompt <span className="text-zinc-500">(optional)</span>
						</label>
						<input id="prompt" placeholder="Enter the prompt" className="input w-full text-sm" {...register("negativePrompt")} />
					</div>
				</div>
				<div className="grow space-y-5">
					<div className="flex flex-col gap-2">
						<label htmlFor="colorScheme" className="label text-xs font-semibold ml-0.5">
							Color Scheme <span className="text-zinc-500">(optional)</span>
						</label>
						<select id="colorScheme" className="select" defaultValue={colorSchemes[0]} {...register("colorScheme")}>
							{colorSchemes.map((scheme) => (
								<option key={scheme} value={scheme}>
									{scheme === "" ? "Not specified" : scheme}
								</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-2">
						<label htmlFor="orientation" className="label text-xs font-semibold ml-0.5">
							Orientation
						</label>
						<select id="orientation" className="select" defaultValue={orientations[0]} {...register("orientation")}>
							{orientations.map((orientation) => {
								const displayName = orientation.split(" ")[0].charAt(0).toUpperCase() + orientation.split(" ")[0].slice(1);
								return (
									<option key={orientation} value={orientation}>
										{displayName}
									</option>
								);
							})}
						</select>
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="guidanceScale" className="label text-xs font-semibold ml-0.5 ">
							Guidance Scale
						</label>
						<input type="range" min="0" max="10" {...register("guidanceScale")} className="range range-xs" />
					</div>

					<div className="flex flex-col gap-2">
						<label htmlFor="seed" className="label text-xs font-semibold ml-0.5">
							Seed
						</label>
						<input {...register("seed")} className="input text-sm" />
					</div>
				</div>
			</div>
			<button type="submit" className="btn btn-primary w-fit mt-10" disabled={isSubmitting}>
				{isSubmitting ? "Generating..." : "Generate Image"}
			</button>
		</form>
	);
}
