import { SignedOut, SignIn, SignUp, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HistoryPage() {
  const { userId } = await auth();
  if (userId) redirect(`/history/${userId}`);

  return (
    <div className="flex justify-center items-center h-full">
      <SignedOut>
        <SignIn afterSignInUrl={`/history/${userId}`} />
      </SignedOut>
    </div>
  );
}
