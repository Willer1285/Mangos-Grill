import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import Order from "@/lib/db/models/order";
import Product from "@/lib/db/models/product";
import { checkoutSchema } from "@/lib/validators/order";
import { sanitize } from "@/lib/db/sanitize";
import { TX_TAX_RATE } from "@/lib/constants";
import crypto from "crypto";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `MG-${timestamp}${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = sanitize(parsed.data);

    await connectDB();

    // Resolve products & calculate totals
    const productIds = data.items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const productMap = new Map(
      products.map((p) => [String(p._id), p])
    );

    let subtotal = 0;
    const orderItems = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const extrasTotal = (item.extras || []).reduce((s, e) => s + e.price, 0);
      const lineSubtotal = (product.price + extrasTotal) * item.quantity;
      subtotal += lineSubtotal;

      return {
        product: product._id,
        name: product.name.en,
        quantity: item.quantity,
        price: product.price,
        modifiers: item.modifiers || [],
        extras: item.extras || [],
        subtotal: lineSubtotal,
      };
    });

    const taxAmount = subtotal * TX_TAX_RATE;
    const shippingCost = 0; // determined client-side, simplified here
    const tip = data.tip || 0;
    const total = subtotal + taxAmount + shippingCost + tip;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      customer: session.user.id,
      items: orderItems,
      deliveryType: data.deliveryType,
      deliveryAddress: data.deliveryAddress,
      tableNumber: data.tableNumber,
      status: "New",
      paymentMethod: data.paymentMethod,
      paymentStatus:
        data.paymentMethod === "credit_card" ? "Completed" : "Pending",
      subtotal,
      taxAmount,
      taxRate: TX_TAX_RATE,
      shippingCost,
      tip,
      total,
      promoCode: data.promoCode,
      notes: data.notes,
    });

    return NextResponse.json(
      { orderNumber: order.orderNumber, orderId: order._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
