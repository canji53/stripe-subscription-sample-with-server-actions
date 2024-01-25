"use server";

import { redirect } from "next/navigation";
import { zfd } from "zod-form-data";
import Stripe from "stripe";

import { getServerStripe } from "@/lib/stripe/getServerStripe";

const Schema = zfd.formData({
  session_id: zfd.text(),
});

export default async function createPortalSession(formData: FormData) {
  let portalSession: Stripe.BillingPortal.Session | undefined;

  try {
    const stripe = getServerStripe();

    const { session_id } = Schema.parse(formData);

    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

    portalSession = await stripe.billingPortal.sessions.create({
      customer: checkoutSession.customer as string,
      return_url: `${process.env.NEXT_PUBLIC_ORIGIN}`,
    });
  } catch (e) {
    console.error(e);
    throw e;
  }

  redirect(portalSession.url);
}
