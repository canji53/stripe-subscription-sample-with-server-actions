import Stripe from "stripe";

let stripe: Stripe | null = null;

export const getServerStripe = () => {
  if (process.env.STRIPE_SECRET_KEY === undefined) {
    throw new Error("STRIPE_SECRET_KEY is undefined");
  }

  if (stripe === null) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripe;
};
