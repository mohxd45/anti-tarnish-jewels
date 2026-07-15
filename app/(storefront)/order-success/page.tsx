import Link from "next/link";
import { OrderSuccessAnimation } from "@/components/ui/OrderSuccessAnimation";
import { getWhatsAppNumber, createWhatsAppUrl } from "@/lib/whatsapp";
import { OrderSuccessCard } from "@/components/ui/OrderSuccessCard";
import { getOrderById } from "@/lib/firestore";
import { ShieldCheck } from "lucide-react";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string, id?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.id || resolvedSearchParams.order;
  
  const whatsappNumber = await getWhatsAppNumber();
  
  const confirmMsg = `Hi LONA JEWELS, I want to confirm my COD order ${orderId || ""}.`;
  const whatsappUrl = createWhatsAppUrl(whatsappNumber, confirmMsg);

  // Fetch the order from the DB to see if advance is required
  const order = orderId ? await getOrderById(orderId) : null;
  const advanceRequired = order?.advanceRequired === true;

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center relative">
      <OrderSuccessCard>
        <OrderSuccessAnimation />
        <h1 className="text-4xl font-serif font-semibold text-champagne">Order Received!</h1>
        
        {advanceRequired ? (
          <div className="mt-6 w-full rounded-2xl bg-[#FFF9FB] border border-[#B8955E]/40 p-5 text-[#3A2428] text-sm max-w-md leading-relaxed text-left space-y-3 shadow-sm">
            <h4 className="font-serif text-[18px] mb-1 font-medium flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#B8955E]" /> Pending Advance
            </h4>
            <p>
              Your order has been received and is pending advance payment. Since your order is above ₹300, <strong>₹100 advance is required to confirm it.</strong>
            </p>
            <p>
              Once the advance is confirmed, the remaining amount will be collected on delivery.
            </p>
            <p className="text-[#8F817B] text-xs pt-2 border-t border-[#E8D7C8]/50 inline-block">
              * ₹100 advance is part of your total, not an extra charge.
            </p>
          </div>
        ) : (
          <div className="mt-6 w-full rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 text-amber-800 text-sm max-w-md leading-relaxed text-left space-y-2">
            <p>
              <strong>Payment Method:</strong> Cash on Delivery
            </p>
            <p>
              <strong>Order Status:</strong> {order?.orderStatus || "Pending Verification"}
            </p>
            <p className="text-stoneGray text-xs pt-1 border-t border-amber-500/20">
              💡 “Your COD order has been received. Our team may contact you on WhatsApp or phone to confirm before shipping.”
            </p>
          </div>
        )}
        
        {orderId && (
          <div className="mt-6 w-full space-y-2">
            <p className="inline-block rounded-full bg-stone-50 px-6 py-3 text-sm text-charcoalBrown font-mono tracking-wider">
              Order Reference: {orderId}
            </p>
            <p className="text-[11px] text-stoneGray/80 block">Please keep your order number safe for tracking.</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 w-full max-w-md">
          {orderId && whatsappNumber && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 font-semibold text-white transition-all text-center text-sm shadow-sm"
            >
              Confirm COD order on WhatsApp
            </a>
          )}
          
          <div className="flex gap-3 w-full">
            {orderId && (
              <Link
                href={`/track-order?order=${orderId}`}
                className="rounded-full bg-champagne px-6 py-3.5 font-semibold text-charcoalBrown hover:opacity-90 transition-all flex-1 text-center text-sm"
              >
                Track Order
              </Link>
            )}
            <Link
              href="/shop"
              className="rounded-full border border-[#F1CFCF]/50 px-6 py-3.5 text-champagne hover:bg-champagne/5 transition-all flex-1 text-center text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </OrderSuccessCard>
    </section>
  );
}
