"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Loader from "@/components/Loader";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) {
      router.push("/billing");
      return;
    }

    // In a real app, you might want to verify the session on the server
    toast.success("Payment successful! Your credits have been added.");

    // Redirect to billing page after a short delay
    const timer = setTimeout(() => {
      router.push("/billing");
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, router]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <Loader message="Processing your payment..." />
      <p className="mt-4 text-muted-foreground">
        You will be redirected shortly.
      </p>
    </div>
  );
}
