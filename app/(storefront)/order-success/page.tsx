import Link from "next/link";
import { OrderSuccessAnimation } from "@/components/ui/OrderSuccessAnimation";
import { getWhatsAppNumber, createWhatsAppUrl } from "@/lib/whatsapp";
import { OrderSuccessCard } from "@/components/ui/OrderSuccessCard";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams.order;
  
  const whatsappNumber = await getWhatsAppNumber();
  
  const confirmMsg = `Hi Anti Tarnish Jewels, I want to confirm my COD order ${orderId || ""}.`;
  const whatsappUrl = createWhatsAppUrl(whatsappNumber, confirmMsg);

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center relative">
      <OrderSuccessCard>
        <OrderSuccessAnimation />
        <h1 className="text-4xl font-serif font-semibold text-champagne">Order Placed!</h1>
        
        <div className="mt-6 w-full rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 text-amber-800 text-sm max-w-md leading-relaxed text-left space-y-2">
          <p>
            <strong>Payment Method:</strong> Cash on Delivery
          </p>
          <p>
            <strong>Order Status:</strong> Pending Verification
          </p>
          <p className="text-stoneGray text-xs pt-1 border-t border-amber-500/20">
            💡 “Your COD order has been received. Our team may contact you on WhatsApp or phone to confirm before shipping.”
          </p>
        </div>
        
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
