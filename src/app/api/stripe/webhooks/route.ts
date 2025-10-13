import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { handleSuccessfulPayment } from "@/actions/billing";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session;
        await handleSuccessfulPayment(session.id);
        break;

      case "invoice.payment_succeeded":
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(
              invoice.subscription as string
            );

            // Update subscription in database
            await prisma.subscription.update({
              where: {
                stripeSubscriptionId: subscription.id,
              },
              data: {
                status: subscription.status,
                currentPeriodEnd: new Date(
                  subscription.current_period_end * 1000
                ),
              },
            });

            // For subscription renewals, reset credits
            const userSubscription = await prisma.subscription.findUnique({
              where: { stripeSubscriptionId: subscription.id },
              include: { user: true },
            });

            if (userSubscription) {
              await prisma.user.update({
                where: { id: userSubscription.user.id },
                data: { credits: 999 }, // Reset unlimited credits
              });
            }
          } catch (error) {
            console.error("Error processing subscription renewal:", error);
          }
        }
        break;

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription;

        try {
          // Update subscription status in database
          await prisma.subscription.update({
            where: {
              stripeSubscriptionId: deletedSubscription.id,
            },
            data: {
              status: "canceled",
            },
          });

          // Reset user credits
          const canceledSub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: deletedSubscription.id },
            include: { user: true },
          });

          if (canceledSub) {
            await prisma.user.update({
              where: { id: canceledSub.user.id },
              data: { credits: 0 }, // Reset to 0
            });
          }
        } catch (error) {
          console.error("Error processing subscription cancellation:", error);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error}`);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}
