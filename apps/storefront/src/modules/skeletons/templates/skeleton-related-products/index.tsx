import repeat from "@lib/util/repeat"
import SkeletonProductPreview from "@modules/skeletons/components/skeleton-product-preview"

const SkeletonRelatedProducts = () => {
  return (
    <div className="product-page-constraint">
      <div className="flex items-end justify-between mb-8">
        <div className="flex flex-col gap-2">
          <div className="w-20 h-5 animate-pulse bg-gray-100"></div>
          <div className="w-72 h-8 animate-pulse bg-gray-100"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-9 h-9 animate-pulse bg-gray-100"></div>
          <div className="w-9 h-9 animate-pulse bg-gray-100"></div>
        </div>
      </div>
      <div className="flex border-l border-t border-b border-gray-200 overflow-hidden">
        {repeat(4).map((index) => (
          <div key={index} className="flex-none w-1/2 small:w-1/3 medium:w-1/4 border-r border-gray-200">
            <SkeletonProductPreview />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SkeletonRelatedProducts
