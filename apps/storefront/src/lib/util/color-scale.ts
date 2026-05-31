export type ColorGroup = {
  id: string
  name: string
  primary?: string | null
  secondary?: string | null
  inverse?: string | null
  neutral?: string | null
  success?: string | null
  warning?: string | null
  danger?: string | null
  info?: string | null
}

const CSS_VAR_MAP: Record<string, string> = {
  primary: "--color-primary",
  secondary: "--color-secondary",
  inverse: "--color-inverse",
  success: "--color-success",
  warning: "--color-warning",
  danger: "--color-danger",
  info: "--color-info",
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "")
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return [h * 360, s * 100, l * 100]
}

function hslToRgbTriplet(h: number, s: number, l: number): string {
  const hn = h / 360,
    sn = s / 100,
    ln = l / 100
  if (sn === 0) {
    const v = Math.round(ln * 255)
    return `${v} ${v} ${v}`
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const r = Math.round(hue2rgb(p, q, hn + 1 / 3) * 255)
  const g = Math.round(hue2rgb(p, q, hn) * 255)
  const bv = Math.round(hue2rgb(p, q, hn - 1 / 3) * 255)
  return `${r} ${g} ${bv}`
}

function wcagLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const n = c / 255
    return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

export function generateColorScale(hex: string) {
  const [r, g, b] = hexToRgb(hex)
  const [h, s, l] = rgbToHsl(r, g, b)
  return {
    DEFAULT: `${r} ${g} ${b}`,
    hover: hslToRgbTriplet(h, s, Math.max(0, l - 8)),
    light: hslToRgbTriplet(
      h,
      Math.max(s, 80),
      Math.min(94, Math.max(l + 47, 82))
    ),
    fg: wcagLuminance(r, g, b) >= 0.179 ? "17 24 39" : "255 255 255",
  }
}

// Returns CSS variable declarations (no :root wrapper) for all defined fields
export function buildCssVars(colorGroup: ColorGroup): string {
  const lines: string[] = []
  for (const [field, cssPrefix] of Object.entries(CSS_VAR_MAP)) {
    const hex = colorGroup[field as keyof ColorGroup] as string | null | undefined
    if (!hex) continue
    const scale = generateColorScale(hex)
    lines.push(`${cssPrefix}:${scale.DEFAULT}`)
    lines.push(`${cssPrefix}-hover:${scale.hover}`)
    lines.push(`${cssPrefix}-light:${scale.light}`)
    lines.push(`${cssPrefix}-fg:${scale.fg}`)
  }
  return lines.join(";")
}
