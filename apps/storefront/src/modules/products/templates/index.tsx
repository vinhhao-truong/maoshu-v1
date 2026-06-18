import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActionsWrapper from "@modules/products/templates/product-actions-wrapper"
import ProductOnboardingCta from "@modules/products/components/product-onboarding-cta"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import ProductBreadcrumb from "@modules/products/components/product-breadcrumb"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <>
      <ProductBreadcrumb product={product} />
      <div
        className="content-container flex flex-col small:flex-row small:items-start py-10 gap-x-12 gap-y-8"
        data-testid="product-container"
      >
        {/* Left: image gallery — compact, sticky */}
        <div className="w-full small:w-[45%] small:max-w-[520px] small:sticky small:top-20">
          <ImageGallery images={images} />
        </div>

        {/* Right: all product details stacked */}
        <div className="flex flex-col flex-1 gap-y-6 small:py-2">
          <ProductOnboardingCta />
          <ProductInfo product={product} />
          <Suspense fallback={<div className="h-10 w-full animate-pulse bg-gray-100 rounded-md" />}>
            <ProductActionsWrapper id={product.id!} region={region} />
          </Suspense>
          <ProductTabs product={product} />
        </div>
      </div>

      <div
        className="content-container my-16 small:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
