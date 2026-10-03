import { calculateCartTotals, getCart, type CartWithItems } from "@/modules/cart/cart.service";
import { cartIdentityFromRequest } from "@/modules/cart/current-cart";
import { getVisibleCategories } from "@/modules/catalog/catalog.service";
import { getCurrentUser } from "@/modules/auth/session";
import { CartDrawerContent } from "./cart-drawer";
import { HeaderClient } from "./header-client";

export async function Header() {
  const [identity, categories, user] = await Promise.all([
    cartIdentityFromRequest(),
    getVisibleCategories(),
    getCurrentUser(),
  ]);
  const cart: CartWithItems | null = await getCart(identity);
  const { itemCount, subtotal } = cart ? calculateCartTotals(cart) : { itemCount: 0, subtotal: 0 };

  return (
    <HeaderClient
      cartDrawer={<CartDrawerContent cart={cart} itemCount={itemCount} subtotal={subtotal} />}
      categories={categories.map((category) => ({ name: category.name, slug: category.slug }))}
      itemCount={itemCount}
      signedIn={Boolean(user)}
    />
  );
}
