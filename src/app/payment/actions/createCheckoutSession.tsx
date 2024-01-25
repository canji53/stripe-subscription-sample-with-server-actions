"use server";

import { redirect } from "next/navigation";
import { zfd } from "zod-form-data";
import Stripe from "stripe";

import { getServerStripe } from "@/lib/stripe/getServerStripe";

const Schema = zfd.formData({
  lookup_key: zfd.text(),
});

export default async function createCheckoutSesssion(formData: FormData) {
  let session: Stripe.Checkout.Session | undefined;

  try {
    const stripe = getServerStripe();

    const { lookup_key } = Schema.parse(formData);

    const prices = await stripe.prices.list({
      lookup_keys: [lookup_key],
      expand: ["data.product"],
    });

    session = await stripe.checkout.sessions.create({
      billing_address_collection: "auto",
      line_items: [
        {
          price: prices.data[0].id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_ORIGIN}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_ORIGIN}/payment?canceled=true`,
    });

    if (!session?.url)
      throw new Error("Failed to create checkout session url.");
  } catch (e) {
    console.error(e);
    throw e;
  }

  redirect(session.url);
}
