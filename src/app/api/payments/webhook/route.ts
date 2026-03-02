import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db/connection";
import Order from "@/lib/db/models/order";
import Payment from "@/lib/db/models/payment";
import type Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  await connectDB();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = paymentIntent.metadata;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "Completed" });
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            status: "Completed",
            transactionId: paymentIntent.id,
          }
        );
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const { orderId } = paymentIntent.metadata;

      if (orderId) {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: "Failed" });
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          { status: "Failed" }
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
