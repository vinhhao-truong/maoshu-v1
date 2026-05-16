export type ThemeName = "pet" | "grocery"

// Handles that map to the pet theme — everything else defaults to grocery
const PET_HANDLES = new Set(["pet", "pets", "pet-supplies"])

export function themeForCategory(category: {
  handle?: string
  metadata?: Record<string, unknown> | null
}): ThemeName {
  // metadata.theme takes priority — set it in the Medusa admin if needed
  const meta = category.metadata?.theme
  if (meta === "pet" || meta === "grocery") return meta

  const handle = category.handle?.toLowerCase() ?? ""
  return PET_HANDLES.has(handle) ? "pet" : "grocery"
}
