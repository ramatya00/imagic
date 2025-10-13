
import { PRICING_PLANS } from "@/lib/stripe";
import PricingCard from "@/components/billing/PricingCard";

export default function PricingPage() {
	return (
		<div className="space-y-6">
			<div className="text-center space-y-4">
				<h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
				<p className="text-muted-foreground max-w-2xl mx-auto">
					Choose the perfect plan for your needs. All plans include high-quality image generation
					with commercial usage rights.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{PRICING_PLANS.map((plan, index) => (
					<PricingCard
						key={plan.name}
						name={plan.name}
						description={plan.description}
						price={plan.price}
						credits={plan.credits}
						priceId={plan.priceId}
						recurring={!!plan.recurring}
						popular={index === 3}
					/>
				))}
			</div>
		</div>
	);
}