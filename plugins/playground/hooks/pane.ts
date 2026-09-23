// Shared bits for the pane-drawing hooks.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

// A hooks module has no Node and no DOM, so neither Buffer nor btoa is there.
export function encodeBase64(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i]! << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0)
    out += ALPHABET[(n >> 18) & 63]! + ALPHABET[(n >> 12) & 63]!
      + (i + 1 < bytes.length ? ALPHABET[(n >> 6) & 63]! : '=')
      + (i + 2 < bytes.length ? ALPHABET[n & 63]! : '=')
  }
  return out
}

// The box a docked pane draws into, in cells. Image and Raster both need it stated.
export function paneSize(e: {
  props: { bodyColumns: number; scroll: { bodyRows: number } }
  viewport?: { columns: number; rows: number }
}): { columns: number; rows: number } {
  return {
    columns: Math.max(1, e.props.bodyColumns > 0 ? e.props.bodyColumns : (e.viewport?.columns ?? 80)),
    rows: Math.max(1, e.props.scroll.bodyRows > 0 ? e.props.scroll.bodyRows : (e.viewport?.rows ?? 30)),
  }
}
