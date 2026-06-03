import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Props = {
  rootCategory?: HttpTypes.StoreProductCategory | null
  tagline?: string | null
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"

const Hero = ({ rootCategory, tagline }: Props) => {
  const meta = rootCategory?.metadata as Record<string, unknown> | null
  const bgImage = (meta?.horizontal_image as string | undefined) ?? FALLBACK_IMAGE
  const slogan =
    tagline ?? rootCategory?.description ?? "Phong cách tối giản, chất lượng vượt trội"

  return (
    <div
      className="h-[37.5vh] w-full relative"
      style={{
        backgroundImage: `url('${bgImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 gap-6">
        <h1 className="text-5xl sm:text-7xl font-light tracking-widest text-white uppercase">
          Maoshu{rootCategory ? ` ${rootCategory.name}` : ""}
        </h1>
        <p className="text-base sm:text-lg text-white/80 tracking-wide font-light max-w-md">
          {slogan}
        </p>
        <LocalizedClientLink
          href="/store"
          className="mt-2 px-8 py-3 border border-white text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors duration-300"
        >
          Khám Phá
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Hero
