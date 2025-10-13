import ImageKit from "imagekit";

const imagekit = new ImageKit({
	publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
	privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
	urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_ENDPOINT!,
});

export async function uploadImageToImageKit(imageUrl: string, fileName: string) {
	try {
		// Fetch the image from the URL
		const response = await fetch(imageUrl);
		const imageBuffer = await response.arrayBuffer();

		// Upload to ImageKit
		const result = await imagekit.upload({
			file: Buffer.from(imageBuffer),
			fileName,
			folder: "/imagic-generated-images",
			useUniqueFileName: true,
			isPrivateFile: false,
		});

		return result.url;
	} catch (error) {
		console.error("Error uploading image to ImageKit:", error);
		throw new Error("Failed to upload image to ImageKit");
	}
}