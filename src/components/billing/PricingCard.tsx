

"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Check } from "lucide-react";
import { createCheckoutSession } from "@/actions/billing";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface PricingCardProps {
	name: string;
	description: string;
	price: number;
	credits?: number;
	priceId?: string;
	recurring?: boolean;
	popular?: boolean;
}

export default function PricingCard({
	name,
	description,
	price,
	credits,
	priceId,
	recurring = false,
	popular = false,
}: PricingCardProps) {
	const [isLoading, setIsLoading] = useState(false);

	const handlePurchase = async () => {
		if (!priceId) return;

		setIsLoading(true);
		try {
			await createCheckoutSession(priceId);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className={`flex flex-col h-full ${popular ? "border-primary shadow-lg" : ""}`}>
			<CardHeader>
				<CardTitle className="flex items-center justify-between">
					{name}
					{popular && (
						<span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
							Popular
						</span>
					)}
				</CardTitle>
				<CardDescription>{description}</CardDescription>
				<div className="mt-2">
					<span className="text-3xl font-bold">${price}</span>
					{recurring && <span className="text-muted-foreground">/month</span>}
				</div>
			</CardHeader>
			<CardContent className="flex-1">
				<ul className="space-y-2">
					{credits && (
						<li className="flex items-center gap-2">
							<Check className="h-4 w-4 text-primary" />
							<span>{credits} credits</span>
						</li>
					)}
					{credits === undefined && (
						<li className="flex items-center gap-2">
							<Check className="h-4 w-4 text-primary" />
							<span>Unlimited generations</span>
						</li>
					)}
					<li className="flex items-center gap-2">
						<Check className="h-4 w-4 text-primary" />
						<span>High quality images</span>
					</li>
					<li className="flex items-center gap-2">
						<Check className="h-4 w-4 text-primary" />
						<span>Commercial usage rights</span>
					</li>
				</ul>
			</CardContent>
			<CardFooter>
				<Button
					onClick={handlePurchase}
					disabled={isLoading || !priceId}
					className="w-full"
					variant={popular ? "default" : "outline"}
				>
					{isLoading ? "Processing..." : `Get ${name}`}
				</Button>
			</CardFooter>
		</Card>
	);
}