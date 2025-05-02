"use client";

import { useState, useEffect } from "react";
import { GenerateImageInput } from "@/lib/validations";
import { 
  getLocalImages, 
  saveLocalImage, 
  clearLocalImages, 
  getLocalLimitStatus,
  canGenerateLocally,
  LocalImage 
} from "@/lib/localImageStorage";
import { useUser } from "@clerk/nextjs";

type ImageGenerationState = {
  isLoading: boolean;
  error: string | null;
  image: {
    id: string;
    imageUrl: string;
    prompt: string;
    negativePrompt?: string | null;
    colorScheme?: string | null;
    orientation: string;
    guidanceScale: number;
    seed?: string | null; 
    createdAt: string;
    published?: boolean;
    storageKey?: string; 
  } | null;
  limitStatus: {
    usage: number;
    max: number;
    canGenerate: boolean;
  } | null;
  isAuthenticated: boolean;
  localImages: LocalImage[];
};

export default function useImageGeneration() {
  const { isSignedIn, user } = useUser();
  
  const [state, setState] = useState<ImageGenerationState>({
    isLoading: false,
    error: null,
    image: null,
    limitStatus: null,
    isAuthenticated: false,
    localImages: [],
  });
  
  useEffect(() => {
    const localImages = getLocalImages();
    const localLimitStatus = getLocalLimitStatus();
    
    setState(prev => ({
      ...prev,
      isAuthenticated: !!isSignedIn,
      localImages,
      limitStatus: !isSignedIn ? localLimitStatus : prev.limitStatus
    }));
    
    if (isSignedIn && localImages.length > 0) {
      migrateLocalImages(localImages);
    }
  }, [isSignedIn]);

  const migrateLocalImages = async (images: LocalImage[]) => {
    try {
      const response = await fetch("/api/images/migrate-local", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ localImages: images }),
      });

      if (response.ok) {
        clearLocalImages();
        setState(prev => ({
          ...prev,
          localImages: [],
        }));
        console.log("Successfully migrated local images to database");
      }
    } catch (error) {
      console.error("Failed to migrate local images:", error);
    }
  };

  const generateImage = async (data: GenerateImageInput) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!state.isAuthenticated && !canGenerateLocally()) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: "You've reached the guest limit of 5 images. Please sign in to generate more.",
          limitStatus: getLocalLimitStatus(),
        }));
        return null;
      }

      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate image");
      }

      const processedImage = {
        ...result.image,
        seed: result.image.seed ? String(result.image.seed) : null,
      };

      if (!result.isAuthenticated) {
        saveLocalImage(result.image as LocalImage);
        const updatedLocalImages = getLocalImages();
        const localLimitStatus = getLocalLimitStatus();
        
        setState({
          isLoading: false,
          error: null,
          image: processedImage,
          limitStatus: localLimitStatus,
          isAuthenticated: false,
          localImages: updatedLocalImages,
        });
      } else {
        setState({
          isLoading: false,
          error: null,
          image: processedImage,
          limitStatus: result.limitStatus,
          isAuthenticated: true,
          localImages: state.localImages,
        });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return null;
    }
  };

  const publishImage = async (imageId: string) => {
    if (!imageId) return null;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch("/api/images/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to publish image");
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        image: {
          ...prev.image!,
          published: true,
        },
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  };

  const resetState = () => {
    setState({
      isLoading: false,
      error: null,
      image: null,
      limitStatus: state.limitStatus,
      isAuthenticated: state.isAuthenticated,
      localImages: state.localImages
    });
  };

  return {
    ...state,
    generateImage,
    publishImage,
    resetState,
    migrateLocalImages,
  };
}
