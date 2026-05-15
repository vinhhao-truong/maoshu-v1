import { logoutAdmin, verifyAdminSession } from "@lib/data/admin"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Maoshu Admin",
}

// ─── Color data ──────────────────────────────────────────────────────────────

type ColorToken = {
  name: string
  tailwind: string
  hex: string
  textDark: boolean // whether to use dark text on this swatch
}

type ColorGroup = {
  label: string
  description?: string
  colors: ColorToken[]
}

const COLOR_PALETTE: ColorGroup[] = [
  {
    label: "Grey Scale",
    description:
      "The core neutral palette used for text, borders, backgrounds, and surfaces.",
    colors: [
      { name: "grey-0", tailwind: "grey-0", hex: "#FFFFFF", textDark: true },
      { name: "grey-5", tailwind: "grey-5", hex: "#F9FAFB", textDark: true },
      { name: "grey-10", tailwind: "grey-10", hex: "#F3F4F6", textDark: true },
      { name: "grey-20", tailwind: "grey-20", hex: "#E5E7EB", textDark: true },
      { name: "grey-30", tailwind: "grey-30", hex: "#D1D5DB", textDark: true },
      { name: "grey-40", tailwind: "grey-40", hex: "#9CA3AF", textDark: true },
      { name: "grey-50", tailwind: "grey-50", hex: "#6B7280", textDark: false },
      { name: "grey-60", tailwind: "grey-60", hex: "#4B5563", textDark: false },
      { name: "grey-70", tailwind: "grey-70", hex: "#374151", textDark: false },
      { name: "grey-80", tailwind: "grey-80", hex: "#1F2937", textDark: false },
      { name: "grey-90", tailwind: "grey-90", hex: "#111827", textDark: false },
    ],
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const isValid = await verifyAdminSession()
  if (!isValid) redirect("/admin/login")

  return (
    <div className="min-h-screen bg-grey-5 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-grey-0 border-b border-grey-20 px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-grey-90 tracking-tight">
            Maoshu Admin
          </h1>
          <span className="text-xs bg-grey-10 text-grey-60 rounded-circle px-2 py-0.5 border border-grey-20">
            Admin
          </span>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="text-xs text-grey-50 hover:text-grey-90 transition-colors"
          >
            Sign out
          </button>
        </form>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page title */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-grey-90">Color Palette</h2>
          <p className="text-sm text-grey-50 mt-1">
            Colors used across the Maoshu storefront.
          </p>
        </div>

        {/* Color groups */}
        <div className="flex flex-col gap-12">
          {COLOR_PALETTE.map((group) => (
            <ColorGroup key={group.label} group={group} />
          ))}
        </div>
      </main>
    </div>
  )
}

// ─── Components ──────────────────────────────────────────────────────────────

function ColorGroup({ group }: { group: ColorGroup }) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-base font-medium text-grey-80">{group.label}</h3>
        {group.description && (
          <p className="text-sm text-grey-50 mt-0.5">{group.description}</p>
        )}
      </div>

      {/* Row strip */}
      <div className="rounded-base overflow-hidden border border-grey-20 flex h-20">
        {group.colors.map((color) => (
          <div
            key={color.name}
            className="flex-1"
            style={{ backgroundColor: color.hex }}
            title={`${color.name} — ${color.hex}`}
          />
        ))}
      </div>

      {/* Token grid */}
      <div className="mt-4 grid grid-cols-2 xsmall:grid-cols-3 small:grid-cols-4 gap-3">
        {group.colors.map((color) => (
          <ColorToken key={color.name} color={color} />
        ))}
      </div>
    </section>
  )
}

function ColorToken({ color }: { color: ColorToken }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-grey-0 rounded-base border border-grey-20">
      {/* Swatch */}
      <div
        className="w-10 h-10 rounded-soft flex-shrink-0 border border-grey-20"
        style={{ backgroundColor: color.hex }}
      />
      {/* Labels */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-grey-80 truncate">{color.name}</p>
        <p className="text-xs text-grey-40 font-mono">{color.hex}</p>
        <p className="text-xs text-grey-40 font-mono truncate">
          bg-{color.tailwind}
        </p>
      </div>
    </div>
  )
}
