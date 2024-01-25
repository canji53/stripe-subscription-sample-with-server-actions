import Stripe from "stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getServerStripe } from "@/lib/stripe/getServerStripe";

export async function POST(req: NextRequest) {
  let event: Stripe.Event | undefined;
  let subscription: Stripe.Subscription | undefined;
  let status: Stripe.Subscription.Status | undefined;

  try {
    const stripe = getServerStripe();

    const signature = headers().get("stripe-signature");
    if (signature === null) {
      throw new Error("stripe-signature is null");
    }

    // WARNING: 生のリクエストボディでないとエラーになる
    const rawBody = await req.text();

    if (process.env.STRIPE_WEBHOOK_SECRET === undefined) {
      throw new Error("STRIPE_WEBHOOK_SECRET is undefined");
    }

    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.log(`⚠️  Webhook signature verification failed.`, e);

    return new NextResponse("Failed to payment webhook.", {
      status: 400,
    });
  }

  switch (event.type) {
    case "customer.subscription.trial_will_end":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription trial ending.
      // handleSubscriptionTrialEnding(subscription);
      break;
    case "customer.subscription.deleted":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription deleted.
      // handleSubscriptionDeleted(subscriptionDeleted);
      break;
    case "customer.subscription.created":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription created.
      // handleSubscriptionCreated(subscription);
      break;
    case "customer.subscription.updated":
      subscription = event.data.object;
      status = subscription.status;
      console.log(`Subscription status is ${status}.`);
      // Then define and call a method to handle the subscription update.
      // handleSubscriptionUpdated(subscription);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }

  return new NextResponse("Success.", {
    status: 200,
  });
}
