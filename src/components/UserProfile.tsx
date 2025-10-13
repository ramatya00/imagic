

import { User } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton, UserButton } from "@clerk/nextjs";

export default function UserProfile() {
	const avatarClasses = "bg-secondary text-neutral-content w-12 h-12 rounded-full";

	return (
		<div className="avatar ring ring-primary ring-offset-2 ring-offset-base-200 rounded-full">
			<SignedOut>
				<div className={avatarClasses}>
					<SignUpButton mode="modal">
						<button className="w-full h-full flex items-center justify-center cursor-pointer">
							<User />
						</button>
					</SignUpButton>
				</div>
			</SignedOut>

			<SignedIn>
				<div className={avatarClasses}>
					<UserButton
						appearance={{
							elements: {
								avatarBox: {
									width: "48px",
									height: "48px",
								},
							},
						}}
					/>
				</div>
			</SignedIn>
		</div>
	);
}