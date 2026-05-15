import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div
      className="h-[75vh] w-full relative"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6 gap-6">
        <h1 className="text-5xl sm:text-7xl font-light tracking-widest text-white uppercase">
          Maoshu
        </h1>
        <p className="text-base sm:text-lg text-white/80 tracking-wide font-light max-w-md">
          Phong cách tối giản, chất lượng vượt trội
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
