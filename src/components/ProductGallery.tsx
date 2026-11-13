"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Expand, X } from "lucide-react";

import { arohiniPhotos } from "@/lib/products";

export function ProductGallery({ compact = false, children }: { compact?: boolean; children?: ReactNode }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const photos = compact ? arohiniPhotos.slice(0, 2) : arohiniPhotos;
  useEffect(() => {
    if (selected === null) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [selected]);

  return (
    <div className={`product-photo-grid${compact ? " product-photo-grid-home" : ""}`} role="group" aria-label="Arohini product photos">
        {photos.map((photo, photoIndex) => (
          <Fragment key={photo.src}>
          <button className={`product-photo-tile${photo.src.includes("poster") ? " product-photo-poster" : ""}`} type="button" onClick={() => setSelected(photoIndex)}
            aria-label={`Enlarge photo: ${photo.alt}`} title="Enlarge photo" aria-haspopup="dialog">
            <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height}
              sizes="(max-width: 760px) calc((100vw - 52px) / 2), (max-width: 1100px) 24vw, 310px"
              priority={!compact && photoIndex === 0} />
            <span className="photo-expand"><Expand size={16} aria-hidden="true" /></span>
          </button>
          {photoIndex === 1 && children}
          </Fragment>
        ))}
      <dialog ref={dialog} className="product-photo-dialog" aria-label="Enlarged Arohini photo"
        onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        {selected !== null && (
          <div className="product-photo-dialog-inner">
            <button type="button" className="photo-close" aria-label="Close photo" title="Close photo" autoFocus onClick={() => dialog.current?.close()}><X size={24} aria-hidden="true" /></button>
            <Image src={photos[selected].src} alt={photos[selected].alt} width={photos[selected].width} height={photos[selected].height} sizes="(max-width: 760px) 92vw, 760px" />
          </div>
        )}
      </dialog>
    </div>
  );
}
