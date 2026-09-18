"use client";

import { useState } from "react";
import Image from "next/image";

export function VehicleGallery({ images, name }: { images: readonly string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="vehicle-gallery">
      <div className="vehicle-detail-photo">
        <Image src={images[activeIndex]} alt={`${name}, foto ${activeIndex + 1}`} fill priority sizes="(max-width: 900px) 100vw, 65vw" />
        <span className="gallery-counter">{images.length} {images.length === 1 ? "foto disponível" : "fotos disponíveis"}</span>
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Fotos do veículo">
          {images.map((image, index) => (
            <button key={`${image}-${index}`} type="button" className={index === activeIndex ? "is-active" : ""} onClick={() => setActiveIndex(index)} aria-label={`Mostrar foto ${index + 1}`} aria-pressed={index === activeIndex}>
              <Image src={image} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
