"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../lib/prisma";
import { stripe } from "../lib/stripe";
import { redirect } from "next/navigation";

export async function createCheckoutSession(priceId: string) {
	const { userId } = await auth();
	if (!userId) {
		throw new Error("You must be logged in to make a purchase");
	}

	// Get or create user
	const user = await prisma.user.findUnique({
		where: { clerkId: userId },
	});

	if (!user) {
		throw new Error("User not found");
	}

	// Create or retrieve Stripe customer
	let customerId = user.stripeCustomerId;

	if (!customerId) {
		const customer = await stripe.customers.create({
			metadata: {
				clerkId: userId,
			},
		});

		await prisma.user.update({
			where: { id: user.id },
			data: { stripeCustomerId: customer.id },
		});

		customerId = customer.id;
	}

	// Get price details from Stripe
	const price = await stripe.prices.retrieve(priceId);

	// Create checkout session
	const session = await stripe.checkout.sessions.create({
		customer: customerId,
		payment_method_types: ['card'],
		line_items: [
			{
				price: priceId,
				quantity: 1,
			},
		],
		mode: price.type === 'recurring' ? 'subscription' : 'payment',
		success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
		metadata: {
			clerkId: userId,
		},
	});

	redirect(session.url!);
}

export async function handleSuccessfulPayment(sessionId: string) {
	try {
		// Retrieve the checkout session
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (!session.customer || !session.metadata?.clerkId) {
			throw new Error("Invalid session data");
		}

		const clerkId = session.metadata.clerkId;
		const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;

		// Get user
		const user = await prisma.user.findUnique({
			where: { clerkId },
		});

		if (!user) {
			throw new Error("User not found");
		}

		// Update user with Stripe customer ID if not already set
		if (!user.stripeCustomerId) {
			await prisma.user.update({
				where: { id: user.id },
				data: { stripeCustomerId: customerId },
			});
		}

		// Handle payment or subscription
		if (session.mode === 'payment') {
			// One-time payment
			const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
			const priceId = lineItems.data[0]?.price?.id;

			if (!priceId) {
				throw new Error("No price found in session");
			}

			// Get price details from our database or Stripe
			const price = await stripe.prices.retrieve(priceId);
			const product = await stripe.products.retrieve(price.product as string);

			// Determine credits based on product metadata or price
			let credits = 0;
			if (product.metadata.credits) {
				credits = parseInt(product.metadata.credits);
			} else {
				// Fallback logic based on price amount
				const amount = price.unit_amount || 0;
				if (amount === 499) credits = 10; // $4.99
				else if (amount === 1999) credits = 50; // $19.99
				else if (amount === 4999) credits = 200; // $49.99
			}

			// Record the purchase
			await prisma.purchase.create({
				data: {
					userId: user.id,
					stripePaymentIntentId: session.payment_intent as string,
					amount: price.unit_amount || 0,
					credits,
					status: 'completed',
				},
			});

			// Add credits to user account
			await prisma.user.update({
				where: { id: user.id },
				data: {
					credits: {
						increment: credits,
					},
				},
			});
		} else if (session.mode === 'subscription') {
			// Subscription
			if (session.subscription) {
				const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

				// Record the subscription
				await prisma.subscription.create({
					data: {
						userId: user.id,
						stripeSubscriptionId: subscription.id,
						stripePriceId: subscription.items.data[0]?.price?.id || '',
						status: subscription.status,
						currentPeriodEnd: new Date(subscription.current_period_end * 1000),
					},
				});

				// For unlimited plan, set a high credit value or handle differently
				await prisma.user.update({
					where: { id: user.id },
					data: {
						credits: 999, // Representing unlimited
					},
				});
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error handling successful payment:", error);
		return { success: false, error: "Failed to process payment" };
	}
}

export async function getUserSubscription() {
	const { userId } = await auth();
	if (!userId) return null;

	const user = await prisma.user.findUnique({
		where: { clerkId: userId },
		include: {
			subscriptions: {
				where: {
					status: {
						in: ['active', 'trialing'],
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				take: 1,
			},
		},
	});

	if (!user || user.subscriptions.length === 0) return null;

	return user.subscriptions[0];
}

export async function getUserPurchases() {
	const { userId } = await auth();
	if (!userId) return [];

	const user = await prisma.user.findUnique({
		where: { clerkId: userId },
	});

	if (!user) return [];

	return prisma.purchase.findMany({
		where: { userId: user.id },
		orderBy: { createdAt: 'desc' },
	});
}