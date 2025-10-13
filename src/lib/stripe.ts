
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: '2023-10-16',
	typescript: true,
});

// Define your pricing plans
export const PRICING_PLANS = [
	{
		name: 'Starter',
		description: 'Perfect for trying out the service',
		credits: 10,
		price: 4.99,
		priceId: process.env.STRIPE_STARTER_PRICE_ID,
	},
	{
		name: 'Creator',
		description: 'Great for regular content creators',
		credits: 50,
		price: 19.99,
		priceId: process.env.STRIPE_CREATOR_PRICE_ID,
	},
	{
		name: 'Professional',
		description: 'For professionals and businesses',
		credits: 200,
		price: 49.99,
		priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
	},
	{
		name: 'Unlimited',
		description: 'Unlimited generations for power users',
		price: 99.99,
		priceId: process.env.STRIPE_UNLIMITED_PRICE_ID,
		recurring: {
			interval: 'month',
		},
	},
];