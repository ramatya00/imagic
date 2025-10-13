"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { getUserImages } from "@/actions/data";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Loader from "@/components/Loader";

const IMAGES_PER_PAGE = 8;

export default function HistoryPage() {
  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedImageId = searchParams.get("imageId");
  const modalRef = useRef<HTMLDialogElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copyURL, setCopyURL] = useState(false);

  const { data: images, isLoading } = useQuery({
    queryKey: ["userImages", userId],
    queryFn: async () => {
      if (!userId) return [];
      const images = await getUserImages(100);
      return images;
    },
    enabled: !!userId,
  });

  const selectedImage = images?.find((img) => img.id === selectedImageId);

  // Calculate pagination
  const totalPages = Math.ceil((images?.length || 0) / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = images?.slice(startIndex, endIndex) || [];

  // Handle modal open/close based on URL
  useEffect(() => {
    if (selectedImageId && modalRef.current) {
      modalRef.current.showModal();
    } else if (modalRef.current) {
      modalRef.current.close();
    }
  }, [selectedImageId]);

  // Reset to page 1 when images change
  useEffect(() => {
    if (images && images.length > 0) {
      const maxPage = Math.ceil(images.length / IMAGES_PER_PAGE);
      if (currentPage > maxPage) {
        setCurrentPage(1);
      }
    }
  }, [images, currentPage]);

  const openImageModal = (imageId: string) => {
    router.push(`/history/${userId}?imageId=${imageId}`, { scroll: false });
  };

  const closeModal = () => {
    router.push(`/history/${userId}`, { scroll: false });
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${prompt
        .slice(0, 50)
        .replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyURL(true);
      setTimeout(() => setCopyURL(false), 3000);
    } catch (error) {
      console.error("Copy failed:", error);
      alert("Failed to copy URL. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader message="Loading your history..." />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-10">
        <p>You haven&apos;t generated any images yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Page Info */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-zinc-400">
            Showing {startIndex + 1}-{Math.min(endIndex, images.length)} of{" "}
            {images.length} images
          </p>
          <p className="text-sm text-zinc-400">
            Page {currentPage} of {totalPages}
          </p>
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image) => (
            <div
              key={image.id}
              className="bg-base-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => openImageModal(image.id)}
            >
              <div className="aspect-square relative">
                <Image
                  src={image.url}
                  alt={image.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-sm font-medium truncate">{image.prompt}</p>
                <p className="text-xs text-accent mt-1">
                  {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="join grid grid-cols-2">
              <button
                className="join-item btn btn-outline"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                Previous page
              </button>
              <button
                className="join-item btn btn-outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <dialog ref={modalRef} className="modal" onClose={closeModal}>
        <div className="modal-box max-w-5xl">
          {selectedImage && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image */}
              <div className="lg:w-2/3">
                <div className="relative w-full aspect-square lg:aspect-auto lg:h-[600px]">
                  <Image
                    src={selectedImage.url}
                    alt={selectedImage.prompt}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              </div>

              {/* Details */}
              <div className="lg:w-1/3 flex flex-col gap-4">
                <h3 className="font-bold text-lg">Image Details</h3>

                <div className="divider my-0"></div>

                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-semibold text-sm text-zinc-300">
                      Prompt:
                    </p>
                    <p className="text-sm text-zinc-400 mt-1 break-words">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {selectedImage.negativePrompt && (
                    <div>
                      <p className="font-semibold text-sm text-zinc-300">
                        Negative Prompt:
                      </p>
                      <p className="text-sm text-zinc-400 mt-1 break-words">
                        {selectedImage.negativePrompt}
                      </p>
                    </div>
                  )}

                  {selectedImage.colorScheme && (
                    <div>
                      <p className="font-semibold text-sm text-zinc-300">
                        Color Scheme:
                      </p>
                      <p className="text-sm text-zinc-400 mt-1">
                        {selectedImage.colorScheme}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-sm text-zinc-300">
                      Aspect Ratio:
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {selectedImage.aspectRatio === "landscape 1920x1080"
                        ? "Landscape"
                        : selectedImage.aspectRatio === "portrait 512x1024"
                        ? "Portrait"
                        : "Square"}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-sm text-zinc-300">
                      Guidance Scale:
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {selectedImage.guidanceScale}
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-sm text-zinc-300">
                      Created At:
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">
                      {new Date(selectedImage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="divider my-0"></div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleDownload(selectedImage.url, selectedImage.prompt)
                    }
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleCopyUrl(selectedImage.url)}
                    className="btn btn-outline btn-sm flex-1"
                  >
                    {copyURL ? "Copied!" : "Copy URL"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Close button */}
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>
          </form>
        </div>

        {/* Backdrop */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </>
  );
}
