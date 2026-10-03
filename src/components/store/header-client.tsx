"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowUpRight, Heart, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";

type CategoryLink = { name: string; slug: string };

const primaryNav = [
  { label: "Shop", href: "/shop" },
  { label: "New", href: "/shop?sort=newest" },
  { label: "Sale", href: "/sale" },
] as const;

export function HeaderClient({ cartDrawer, categories, itemCount, signedIn }: { cartDrawer: ReactNode; categories: CategoryLink[]; itemCount: number; signedIn: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setMenuOpen(false);
    setCartOpen(false);
    setCollectionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = searchOpen || menuOpen || cartOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen, menuOpen, cartOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setCartOpen(false);
        setCollectionsOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? "border-b border-white/10 bg-ink/85 backdrop-blur-md" : "border-b border-transparent"
        }`}
      >
        <div className="page-shell flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <Link aria-label="SEVEN ROCK home" className="wordmark text-[15px] text-paper sm:text-base lg:text-lg" href="/">
            SEVEN ROCK
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {primaryNav.slice(0, 1).map((item) => (
              <Link className="link-line text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/70 transition-colors hover:text-paper" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
            <div onMouseEnter={() => setCollectionsOpen(true)} onMouseLeave={() => setCollectionsOpen(false)}>
              <button
                aria-expanded={collectionsOpen}
                className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/70 transition-colors hover:text-paper"
                onClick={() => setCollectionsOpen((open) => !open)}
                type="button"
              >
                Collections
                <span aria-hidden className={`inline-block h-1 w-1 rounded-full bg-rust transition-opacity ${collectionsOpen ? "opacity-100" : "opacity-0"}`} />
              </button>
              {collectionsOpen && (
                <div className="absolute inset-x-0 top-full animate-overlay-in border-b border-white/10 bg-ink/95 backdrop-blur-md">
                  <div className="page-shell grid grid-cols-3 gap-x-10 gap-y-5 py-9">
                    {categories.map((category, index) => (
                      <Link className="group flex items-baseline gap-5" href={`/category/${category.slug}`} key={category.slug}>
                        <span className="meta">{String(index + 1).padStart(2, "0")}</span>
                        <span className="text-sm uppercase tracking-[0.08em] text-paper/75 transition-colors group-hover:text-paper">{category.name}</span>
                      </Link>
                    ))}
                    <Link className="group flex items-baseline gap-5 col-span-3 mt-1" href="/shop">
                      <span className="meta text-rust">→</span>
                      <span className="text-sm uppercase tracking-[0.08em] text-paper">View the full catalogue</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {primaryNav.slice(1).map((item) => (
              <Link className="link-line text-[11px] font-semibold uppercase tracking-[0.22em] text-paper/70 transition-colors hover:text-paper" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 lg:gap-6">
            <button
              aria-label="Search"
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70 transition-colors hover:text-paper"
              onClick={() => setSearchOpen(true)}
              type="button"
            >
              <Search className="transition-transform duration-300 group-hover:scale-110" size={17} strokeWidth={1.5} />
              <span className="hidden xl:inline">Search</span>
            </button>
            <Link
              aria-label="Account"
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70 transition-colors hover:text-paper"
              href={signedIn ? "/account" : "/login"}
            >
              <UserRound className="transition-transform duration-300 group-hover:scale-110" size={17} strokeWidth={1.5} />
              <span className="hidden xl:inline">Account</span>
            </Link>
            <Link
              aria-label="Wishlist"
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70 transition-colors hover:text-paper"
              href="/account/wishlist"
            >
              <Heart className="transition-transform duration-300 group-hover:scale-110" size={17} strokeWidth={1.5} />
              <span className="hidden xl:inline">Wishlist</span>
            </Link>
            <button
              aria-label={`Open bag, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className="group flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/70 transition-colors hover:text-paper"
              onClick={() => setCartOpen(true)}
              type="button"
            >
              <span className="relative">
                <ShoppingBag className="transition-transform duration-300 group-hover:scale-110" size={17} strokeWidth={1.5} />
                {itemCount > 0 && <span aria-hidden className="absolute -right-2 -top-1.5 font-mono text-[10px] font-semibold text-rust">{itemCount}</span>}
              </span>
              <span className="hidden xl:inline">Bag{itemCount > 0 ? ` [${itemCount}]` : ""}</span>
            </button>
            <button aria-label="Open menu" className="text-paper lg:hidden" onClick={() => setMenuOpen(true)} type="button">
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-ink/97 backdrop-blur-xl animate-overlay-in">
          <div className="page-shell flex h-16 items-center justify-between border-b border-white/10">
            <span className="wordmark text-[15px] text-paper">SEVEN ROCK</span>
            <button aria-label="Close search" className="text-paper/70 transition-colors hover:text-paper" onClick={() => setSearchOpen(false)} type="button">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <div className="page-shell w-full max-w-3xl flex-1 overflow-y-auto py-14 sm:py-24">
            <p className="meta">01 / Search</p>
            <form action="/search" className="mt-6 flex items-center gap-4 border-b border-white/25 pb-5 transition-colors focus-within:border-paper">
              <Search className="shrink-0 text-mist" size={24} strokeWidth={1.5} />
              <input
                autoFocus
                className="w-full bg-transparent font-display text-2xl font-bold uppercase tracking-[-0.01em] text-paper outline-none placeholder:font-normal placeholder:text-mist/40 sm:text-4xl"
                name="q"
                placeholder="SEARCH THE CATALOGUE"
                type="search"
              />
              <button aria-label="Submit search" className="shrink-0 text-paper/60 transition-colors hover:text-rust" type="submit">
                <ArrowUpRight size={28} strokeWidth={1.5} />
              </button>
            </form>
            <div className="mt-10">
              <p className="meta">Collections</p>
              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
                {categories.map((category, index) => (
                  <Link className="group flex items-baseline gap-4" href={`/category/${category.slug}`} key={category.slug}>
                    <span className="meta">{String(index + 1).padStart(2, "0")}</span>
                    <span className="text-sm uppercase tracking-[0.08em] text-paper/75 transition-colors group-hover:text-paper">{category.name}</span>
                  </Link>
                ))}
              </div>
              <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-mist/70">Live catalogue search — every result is a real, in-stock product.</p>
            </div>
          </div>
        </div>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[80]">
          <button aria-label="Close bag" className="absolute inset-0 animate-overlay-in bg-ink/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} type="button" />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/10 bg-charcoal animate-drawer-in">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-6">
              <span className="meta !text-paper">Your bag [{itemCount}]</span>
              <button aria-label="Close bag" className="text-paper/70 transition-colors hover:text-paper" onClick={() => setCartOpen(false)} type="button">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            <div className="min-h-0 flex-1">{cartDrawer}</div>
          </aside>
        </div>
      )}

      {menuOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-ink animate-overlay-in">
          <div className="page-shell flex h-16 shrink-0 items-center justify-between border-b border-white/10">
            <span className="wordmark text-[15px] text-paper">SEVEN ROCK</span>
            <button aria-label="Close menu" className="text-paper/70 transition-colors hover:text-paper" onClick={() => setMenuOpen(false)} type="button">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="Mobile" className="page-shell flex-1 py-10">
            <div className="space-y-7">
              {primaryNav.map((item, index) => (
                <Link
                  className="flex items-baseline gap-5 animate-rise"
                  href={item.href}
                  key={item.href}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <span className="meta">{String(index + 1).padStart(2, "0")}</span>
                  <span className="font-display text-3xl font-bold uppercase tracking-[-0.01em] text-paper">{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="mt-12 border-t border-white/10 pt-8">
              <p className="meta">Collections</p>
              <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">
                {categories.map((category) => (
                  <Link className="text-sm uppercase tracking-[0.08em] text-paper/75" href={`/category/${category.slug}`} key={category.slug}>
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
          <div className="page-shell shrink-0 border-t border-white/10 py-6">
            <div className="flex items-center justify-between">
              <Link className="meta text-paper/70" href={signedIn ? "/account" : "/login"}>{signedIn ? "Account" : "Sign in"}</Link>
              <Link className="meta text-paper/70" href="/account/wishlist">Wishlist</Link>
              <Link className="meta text-paper/70" href="/cart">Bag{itemCount > 0 ? ` [${itemCount}]` : ""}</Link>
            </div>
            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-mist/60">SEVEN ROCK — DHAKA, BANGLADESH — 2026</p>
          </div>
        </div>
      )}
    </>
  );
}
