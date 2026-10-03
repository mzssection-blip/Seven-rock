"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { addToCartAction, buyNowAction, type CartActionState } from "@/app/actions/cart";

export type VariantChoice = { id: string; color: string | null; size: string | null; available: boolean };

export function AddToCartForm({ productId, slug, variants }: { productId: string; slug: string; variants: VariantChoice[] }) {
  const defaultVariant = variants.find((variant) => variant.available) ?? variants[0];
  const [color, setColor] = useState<string | null>(defaultVariant?.color ?? null);
  const [size, setSize] = useState<string | null>(defaultVariant?.size ?? null);
  const [quantity, setQuantity] = useState(1);
  const [addState, addAction, addPending] = useActionState<CartActionState, FormData>(addToCartAction, undefined);
  const [buyState, buyAction, buyPending] = useActionState<CartActionState, FormData>(buyNowAction, undefined);

  const colors = useMemo(() => [...new Set(variants.map((variant) => variant.color).filter((value): value is string => Boolean(value)))], [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((variant) => variant.size).filter((value): value is string => Boolean(value)))], [variants]);
  const current = useMemo(() => variants.find((variant) => variant.color === color && variant.size === size), [color, size, variants]);
  const available = Boolean(current?.available);
  const pending = addPending || buyPending;
  const state = addState?.error || buyState?.error ? (addState?.error ? addState : buyState) : addState?.message ? addState : buyState;

  const selectColor = (value: string) => {
    setColor(value);
    const match =
      variants.find((variant) => variant.color === value && variant.size === size && variant.available) ??
      variants.find((variant) => variant.color === value && variant.available);
    if (match) setSize(match.size);
  };

  const selectSize = (value: string) => setSize(value);

  const selectorButton = (key: string, active: boolean, disabled: boolean, label: string, onClick: () => void) => (
    <button
      key={key}
      className={`border px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${
        disabled ? "cursor-not-allowed border-white/10 text-mist/40 line-through" : active ? "border-paper bg-paper text-ink" : "border-white/20 text-paper/85 hover:border-white/60 hover:text-paper"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <form className="space-y-6">
      <input name="productId" type="hidden" value={productId} />
      <input name="slug" type="hidden" value={slug} />
      <input name="variantId" type="hidden" value={current?.id ?? ""} />
      <input name="quantity" type="hidden" value={quantity} />

      {colors.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <p className="meta">Colour</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">{color}</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((value) => selectorButton(value, value === color, false, value, () => selectColor(value)))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <div className="flex items-baseline justify-between">
            <p className="meta">Size</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-paper/70">BD standard fit</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((value) => {
              const asAvailable = variants.some((variant) => variant.color === color && variant.size === value && variant.available);
              return selectorButton(value, value === size, !asAvailable, value, () => selectSize(value));
            })}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 flex items-stretch gap-3 border-t border-white/10 bg-ink/95 px-4 py-4 backdrop-blur sm:mx-0 sm:static sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 lg:static lg:px-0">
        <div className="flex shrink-0 items-center border border-white/20">
          <button aria-label="Decrease quantity" className="grid h-full w-11 place-items-center text-paper/80 transition-colors hover:text-paper disabled:opacity-30" disabled={quantity === 1} onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">
            <Minus size={14} strokeWidth={1.5} />
          </button>
          <span className="w-9 text-center text-sm font-bold text-paper">{quantity}</span>
          <button aria-label="Increase quantity" className="grid h-full w-11 place-items-center text-paper/80 transition-colors hover:text-paper disabled:opacity-30" disabled={quantity === 10} onClick={() => setQuantity((value) => Math.min(10, value + 1))} type="button">
            <Plus size={14} strokeWidth={1.5} />
          </button>
        </div>
        <button className="btn-solid flex-1 !px-4" disabled={pending || !available} formAction={addAction} type="submit">
          {addPending ? "Adding…" : "Add to bag"}
        </button>
        <button className="btn-outline flex-1 !px-4" disabled={pending || !available} formAction={buyAction} type="submit">
          Buy now
        </button>
      </div>

      {!available && current && <p aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.2em] text-rust">This size is sold out — pick another.</p>}
      {state?.error && <p aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.2em] text-rust">{state.error}</p>}
      {state?.message && <p aria-live="polite" className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{state.message}</p>}
    </form>
  );
}
