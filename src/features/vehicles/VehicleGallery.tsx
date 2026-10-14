"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export function VehicleGallery({ images, name }: { images: readonly string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [activeIndex]);

  function handleScroll() {
    if (!trackRef.current) return;
    const { scrollLeft, clientWidth } = trackRef.current;
    if (clientWidth > 0) {
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeIndex && newIndex >= 0 && newIndex < images.length) {
        setActiveIndex(newIndex);
      }
    }
  }

  function scrollToIndex(index: number) {
    if (!trackRef.current) return;
    const clientWidth = trackRef.current.clientWidth;
    trackRef.current.scrollTo({
      left: index * clientWidth,
      behavior: "smooth",
    });
    setActiveIndex(index);
  }

  function prev() {
    if (activeIndex > 0) scrollToIndex(activeIndex - 1);
  }

  function next() {
    if (activeIndex < images.length - 1) scrollToIndex(activeIndex + 1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  }

  return (
    <div className="vehicle-gallery" role="region" aria-roledescription="carrossel" aria-label={`Galeria de fotos de ${name}`}>
      <div className="vehicle-detail-photo-wrapper">
        <div
          ref={trackRef}
          tabIndex={0}
          className="vehicle-detail-photo gallery-scroll-track"
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          aria-label={`Fotos de ${name}. Use as setas do teclado ou arraste lateralmente.`}
        >
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="gallery-slide">
              <Image
                src={image}
                alt={`${name}, foto ${index + 1}`}
                fill
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 900px) 100vw, 65vw"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav-btn gallery-prev"
              onClick={prev}
              disabled={activeIndex === 0}
              aria-label="Foto anterior"
            >
              ←
            </button>
            <button
              type="button"
              className="gallery-nav-btn gallery-next"
              onClick={next}
              disabled={activeIndex === images.length - 1}
              aria-label="Próxima foto"
            >
              →
            </button>
          </>
        )}

        <div className="gallery-counter">
          <span className="gallery-counter-curr">{activeIndex + 1} / {images.length}</span>
          <span className="gallery-counter-sep">·</span>
          <span>{images.length} {images.length === 1 ? "foto disponível" : "fotos disponíveis"}</span>
        </div>
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Fotos do veículo">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              ref={(el) => {
                thumbnailRefs.current[index] = el;
              }}
              type="button"
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => scrollToIndex(index)}
              aria-label={`Mostrar foto ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <Image src={image} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
