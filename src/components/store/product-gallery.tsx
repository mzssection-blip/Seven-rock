"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { id: string; url: string; alt: string | null };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = images[selectedIndex];

  if (!selected) return <div className="aspect-[3/4] bg-charcoal" />;

  return (
    <div>
      <div className="group relative aspect-[3/4] overflow-hidden bg-charcoal">
        <Image
          alt={selected.alt || productName}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          fetchPriority={selectedIndex === 0 ? "high" : "auto"}
          fill
          loading={selectedIndex === 0 ? "eager" : "lazy"}
          priority={false}
          sizes="(max-width: 1024px) 100vw, 55vw"
          src={selected.url}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 flex justify-between p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="meta !text-paper/80">
            {String(selectedIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </span>
        </div>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-auto no-scrollbar-hidden">
          {images.map((image, index) => (
            <button
              aria-label={`View image ${index + 1}`}
              className={`relative h-20 w-16 shrink-0 overflow-hidden border transition-opacity ${index === selectedIndex ? "border-paper opacity-100" : "border-white/15 opacity-50 hover:opacity-90"}`}
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              type="button"
            >
              <Image alt={image.alt || ""} className="object-cover" fill priority={false} sizes="64px" src={image.url} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
