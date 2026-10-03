import { CheckoutForm } from "@/components/store/checkout-form";
import { calculateCartTotals, getCart } from "@/modules/cart/cart.service";
import { cartIdentityFromRequest } from "@/modules/cart/current-cart";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const identity = await cartIdentityFromRequest();
  const cart = await getCart(identity);
  const summary = cart?.items.length ? { ...calculateCartTotals(cart), couponCode: cart.couponCode } : null;
  return <div className="page-shell py-10 sm:py-14"><CheckoutForm signedIn={Boolean(identity.userId)} summary={summary} /></div>;
}
