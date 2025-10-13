"use client";

import { toast } from "react-hot-toast";
import {
	colorSchemes,
	GenerateImageInput,
	generateImageSchema,
	aspectRatio,
} from "@/lib/validations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createImage } from "@/actions/actions";
import { canGenerate } from "@/actions/auth";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "../Loader";
import { getLatestImage } from "@/actions/data";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";
import { useRef, useEffect, forwardRef } from "react";
import Link from "next/link";

export default function GenerateForm() {
	const queryClient = useQueryClient();
	const imageWrapperRef = useRef<HTMLDivElement>(null);


	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<GenerateImageInput>({
		resolver: zodResolver(generateImageSchema),
		defaultValues: {
			guidanceScale: 7,
		},
	});

	const { data: canGenerateData, isLoading: isLoadingPermissions } = useQuery({ queryKey: ["canGenerate"], queryFn: canGenerate });
	const { data: latestImage, isLoading: isLoadingImage } = useQuery({
		queryKey: ["latestImage"],
		queryFn: getLatestImage,
	});

	useEffect(() => {
		if (isSubmitting) {
			imageWrapperRef.current?.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	}, [isSubmitting]);

	const onSubmit = async (data: GenerateImageInput) => {
		try {
			queryClient.setQueryData(["latestImage"], null);
			const result = await createImage(data);
			if (result.success) {
				toast.success("Image generated successfully!");
				queryClient.invalidateQueries({ queryKey: ["latestImage"] });
				queryClient.invalidateQueries({ queryKey: ["canGenerate"] });
				reset();
			}
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Failed to generate image");
			queryClient.invalidateQueries({ queryKey: ["latestImage"] });
		}
	};

	const guidanceScaleValue = watch('guidanceScale')


	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="flex flex-col md:flex-row gap-5 mb-5 md:justify-between md:items-center md:mb-10">
					{/* Heading */}
					<h2 className="text-2xl font-bold">Generate Image with AI</h2>
					{/* Status Banner */}
					<div className="bg-zinc-500 alert w-fit px-4 py-2">
						<div className="text-xs font-medium">
							{isLoadingPermissions ? (
								"Checking your credits..."
							) : canGenerateData?.isGuest ? (
								`Free Tier: ${canGenerateData.remaining} generation${canGenerateData.remaining !== 1 ? 's' : ''} remaining`
							) : (
								`Credits: ${canGenerateData?.remaining || 0} available`
							)}
						</div>
						{canGenerateData?.remaining === 0 && (
							<div className="text-xs opacity-80">
								{canGenerateData?.message || "Purchase more credits to continue generating"}
							</div>
						)}
					</div>
				</div>
				<div className="flex flex-wrap gap-5 md:gap-16">
					<div className="w-full md:w-2/3 space-y-5">
						<div className="flex flex-col gap-2">
							<label
								htmlFor="prompt"
								className="label text-xs font-semibold ml-0.5 text-accent"
							>
								Prompt
							</label>
							<textarea
								id="prompt"
								placeholder="Enter the prompt"
								className="textarea w-full text-sm"
								rows={8}
								{...register("prompt")}
							/>
							{errors.prompt && (
								<span className="text-error text-xs">{errors.prompt.message}</span>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<label
								htmlFor="negativePrompt"
								className="label text-xs font-semibold ml-0.5 text-accent"
							>
								Negative Prompt <span className="text-zinc-500">(optional)</span>
							</label>
							<input
								id="negativePrompt"
								placeholder="Enter the prompt"
								className="input w-full text-sm"
								{...register("negativePrompt")}
							/>
							{errors.negativePrompt && (
								<span className="text-error text-xs">{errors.negativePrompt.message}</span>
							)}
						</div>
					</div>
					<div className="grow space-y-5">
						<div className="flex flex-col gap-2">
							<label
								htmlFor="colorScheme"
								className="label text-xs font-semibold ml-0.5 text-accent	"
							>
								Color Scheme <span className="text-zinc-500">(optional)</span>
							</label>
							<select
								id="colorScheme"
								className="select"
								defaultValue={colorSchemes[0]}
								{...register("colorScheme")}
							>
								{colorSchemes.map((scheme) => (
									<option key={scheme} value={scheme}>
										{scheme === "" ? "Not specified" : scheme}
									</option>
								))}
							</select>
							{errors.colorScheme && (
								<span className="text-error text-xs">{errors.colorScheme.message}</span>
							)}
						</div>
						<div className="flex flex-col gap-2">
							<label
								htmlFor="aspectRatio"
								className="label text-xs font-semibold ml-0.5 text-accent"
							>
								Aspect Ratio
							</label>
							<select
								id="aspectRatio"
								className="select"
								defaultValue={aspectRatio[0]}
								{...register("aspectRatio")}
							>
								{aspectRatio.map((ratio) => {
									return (
										<option key={ratio} value={ratio}>
											{ratio === "landscape 1920x1080" ? "Landscape" : ratio === "portrait 512x1024" ? "Portrait" : "Square"}
										</option>
									);
								})}
							</select>
							{errors.aspectRatio && (
								<span className="text-error text-xs">{errors.aspectRatio.message}</span>
							)}
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="guidanceScale"
								className="label text-xs font-semibold ml-0.5 text-accent"
							>
								Guidance Scale: <span className="text-zinc-300">{guidanceScaleValue}</span>
							</label>
							<input
								type="range"
								min="0"
								max="10"
								step="0.5"
								{...register("guidanceScale", { valueAsNumber: true })}
								className="range range-xs"
							/>
							{errors.guidanceScale && (
								<span className="text-error text-xs">{errors.guidanceScale.message}</span>
							)}
						</div>
					</div>
				</div>
				<div className="space-x-3">
					<button
						type="submit"
						className="btn btn-primary w-fit mt-10"
						disabled={isSubmitting || !canGenerateData?.allowed}
					>
						{isSubmitting ? "Generating..." : "Generate Image"}
					</button>
					{
						canGenerateData?.remaining === 0 && (
							<button
								type="button"
								className="btn btn-primary w-fit mt-10"
								disabled={isSubmitting || canGenerateData?.allowed}
							>
								<Link href={"/pricing"}>
									Purchase Credits
								</Link>
							</button>
						)
					}
				</div>
			</form>

			<Wrapper ref={imageWrapperRef}>
				{isSubmitting ? (
					<div className="flex flex-col items-center p-4">
						<Loader message="Generating image" />
					</div>
				) : !isSubmitting && (isLoadingPermissions || isLoadingImage) ? (
					<div className="flex flex-col items-center p-4">
						<Loader message="Loading image" />
					</div>
				) : latestImage ? (
					<div className="w-full flex flex-col lg:flex-row p-4 sm:p-6 lg:p-10 gap-6 lg:gap-10">
						<div className={cn(
							"w-full lg:w-2/3",
							latestImage.aspectRatio === "landscape 1920x1080" && "lg:w-3/4",
							latestImage.aspectRatio === "portrait 512x1024" && "lg:w-1/2"
						)}>
							<Image
								src={latestImage.url}
								alt={latestImage.prompt || "Generated image"}
								width={1920}
								height={1080}
								className="w-full h-auto rounded-xl lg:rounded-2xl object-contain"
								priority
							/>
						</div>
						<div className={cn(
							"w-full lg:w-1/3 space-y-3 sm:space-y-4",
							latestImage.aspectRatio === "landscape 1920x1080" && "lg:w-1/4",
							latestImage.aspectRatio === "portrait 512x1024" && "lg:w-1/2"
						)}>
							<div className="flex flex-col gap-2 text-sm">
								<p className="font-semibold text-zinc-300">Prompt:</p>
								<p className="text-zinc-400 break-words">{latestImage.prompt}</p>
							</div>
							{latestImage.negativePrompt && (
								<div className="flex flex-col gap-2 text-sm">
									<p className="font-semibold text-zinc-300">Negative Prompt:</p>
									<p className="text-zinc-400 break-words">{latestImage.negativePrompt}</p>
								</div>
							)}
							{latestImage.colorScheme && (
								<div className="flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
									<p className="font-semibold text-zinc-300">Color Scheme:</p>
									<p className="text-zinc-400">{latestImage.colorScheme}</p>
								</div>
							)}
							<div className="flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
								<p className="font-semibold text-zinc-300">Aspect Ratio:</p>
								<p className="text-zinc-400">{latestImage.aspectRatio === "landscape 1920x1080" ? "Landscape" : latestImage.aspectRatio === "portrait 512x1024" ? "Portrait" : "Square"}</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
								<p className="font-semibold text-zinc-300">Guidance Scale:</p>
								<p className="text-zinc-400">{latestImage.guidanceScale}</p>
							</div>
							<div className="flex flex-col sm:flex-row gap-2 sm:items-center text-sm">
								<p className="font-semibold text-zinc-300">Created At:</p>
								<p className="text-zinc-400">{latestImage.createdAt.toLocaleString()}</p>
							</div>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center text-neutral-400 font-medium gap-2 p-4">
						<ImageIcon className="w-16 h-16 sm:w-20 sm:h-20" />
						<p className="text-sm sm:text-base">Generate your image</p>
					</div>
				)}
			</Wrapper>
		</>
	);
}

const Wrapper = forwardRef<HTMLDivElement, { children: React.ReactNode }>(
	({ children }, ref) => {
		return (
			<div
				ref={ref}
				className="mt-10 min-h-[calc(500px)] flex items-center justify-center rounded-2xl bg-neutral overflow-hidden"
			>
				{children}
			</div>
		)
	}
);

Wrapper.displayName = "Wrapper";