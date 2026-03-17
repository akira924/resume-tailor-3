import jsPDF from 'jspdf'

interface FontVariant {
  file: string
  style: string
}

interface CustomFontDef {
  family: string
  variants: FontVariant[]
}

const CUSTOM_FONTS: Record<string, CustomFontDef> = {
  segoeui: {
    family: 'segoeui',
    variants: [
      { file: '/fonts/segoeui.ttf', style: 'normal' },
      { file: '/fonts/segoeuib.ttf', style: 'bold' },
      { file: '/fonts/segoeuii.ttf', style: 'italic' },
    ],
  },
}

const fontCache = new Map<string, string>()

async function fetchFontBase64(url: string): Promise<string> {
  if (fontCache.has(url)) return fontCache.get(url)!

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load font: ${url}`)

  const buf = await res.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const base64 = btoa(binary)

  fontCache.set(url, base64)
  return base64
}

export function isCustomFont(family: string): boolean {
  return family in CUSTOM_FONTS
}

export async function registerCustomFont(doc: jsPDF, family: string): Promise<void> {
  const def = CUSTOM_FONTS[family]
  if (!def) return

  for (const v of def.variants) {
    const base64 = await fetchFontBase64(v.file)
    const vfsName = v.file.split('/').pop()!
    doc.addFileToVFS(vfsName, base64)
    doc.addFont(vfsName, def.family, v.style)
  }
}

export async function preloadFont(family: string): Promise<void> {
  const def = CUSTOM_FONTS[family]
  if (!def) return

  await Promise.all(def.variants.map((v) => fetchFontBase64(v.file)))
}
