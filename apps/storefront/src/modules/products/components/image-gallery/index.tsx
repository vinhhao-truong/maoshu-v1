"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const AUTOPLAY_DELAY = 10_000

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [current, setCurrent] = useState(0)
  const [tick, setTick] = useState(0)

  const goTo = useCallback((index: number) => {
    setCurrent(index)
    setTick((t) => t + 1)
  }, [])

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => {
      setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))
    }, AUTOPLAY_DELAY)
    return () => window.clearInterval(id)
  }, [images.length, tick])

  if (images.length === 0) {
    return (
      <Container className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle flex items-center justify-center">
        <PlaceholderImage size={24} />
      </Container>
    )
  }

  if (images.length === 1) {
    return (
      <Container className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle">
        {!!images[0].url && (
          <Image
            src={images[0].url}
            priority
            className="absolute inset-0 rounded-md"
            alt="Product image"
            fill
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            style={{ objectFit: "cover" }}
          />
        )}
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      {/* Main slide */}
      <div className="relative aspect-[29/34] w-full overflow-hidden bg-ui-bg-subtle rounded-md">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-300 ${
              index === current ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {!!image.url && (
              <Image
                src={image.url}
                priority={index === 0}
                className="rounded-md"
                alt={`Product image ${index + 1}`}
                fill
                sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
                style={{ objectFit: "cover" }}
              />
            )}
          </div>
        ))}

      </div>

      {/* Thumbnail strip */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => goTo(index)}
            className={`relative flex-shrink-0 w-16 h-16 overflow-hidden rounded border-2 transition-colors ${
              index === current
                ? "border-ui-fg-base"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            aria-label={`View image ${index + 1}`}
          >
            {!!image.url && (
              <Image
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="64px"
                style={{ objectFit: "cover" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
