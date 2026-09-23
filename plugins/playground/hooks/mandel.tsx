/* @jsx h */
import type { EngineInterface, Register } from 'claude-code'
import { encodeBase64, paneSize } from './pane.ts'

const PANE = 'mandel'
const MAX_ITER = 250
const MAX_PIXELS = 480_000 // the engine refuses over 2 MiB of Image source in one tree (4 bytes a pixel)

let shown = false
let view = { cx: -0.6, cy: 0, width: 3.2 }
let cached = { key: '', rgba: '', width: 0, height: 0 }

function escapeIters(cr: number, ci: number): number {
  let x = 0, y = 0, i = 0
  while (x * x + y * y <= 4 && i < MAX_ITER) {
    const t = x * x - y * y + cr
    y = 2 * x * y + ci
    x = t
    i++
  }
  return i
}

// a cell is about twice as tall as it is wide, so the base grid is 1x2 pixels a cell
function scaleFor(columns: number, rows: number): number {
  let k = 1
  while (columns * (k + 1) * rows * 2 * (k + 1) <= MAX_PIXELS) k++
  return k
}

export function paint(columns: number, rows: number): { rgba: string; width: number; height: number } {
  const key = `${view.cx},${view.cy},${view.width},${columns},${rows}`
  if (cached.key === key) return cached
  const k = scaleFor(columns, rows)
  const width = columns * k
  const height = rows * 2 * k
  const step = view.width / width
  const left = view.cx - view.width / 2
  const top = view.cy - (height * step) / 2
  const px = new Uint8Array(width * height * 4)
  for (let y = 0; y < height; y++) {
    const ci = top + y * step
    for (let x = 0; x < width; x++) {
      const iter = escapeIters(left + x * step, ci)
      const at = (y * width + x) * 4
      if (iter < MAX_ITER) {
        const t = iter / MAX_ITER
        px[at] = Math.round(255 * Math.sqrt(t))
        px[at + 1] = Math.round(255 * t * t * t)
        px[at + 2] = Math.round(255 * Math.sin(Math.PI * t) ** 2)
      }
      px[at + 3] = 255
    }
  }
  cached = { key, rgba: encodeBase64(px), width, height }
  return cached
}

export const mandelCommand = {
  name: 'mandel',
  description: 'Draw the Mandelbrot set in a pane',
  argumentHint: '[cx cy width] | close',
  immediate: true,
}

export const registerMandel: Register = (on) => {
  on('command.run', { command: 'mandel' }, async ($, e) => {
    const args = e.args.trim().split(/\s+/).filter(Boolean)
    if (args[0] === 'close') {
      shown = false
      await $.ui.close({ id: PANE })
      return { text: 'mandel: closed' }
    }
    const nums = args.map(Number)
    if (nums.length === 3 && nums.every(n => Number.isFinite(n)) && nums[2]! > 0) {
      view = { cx: nums[0]!, cy: nums[1]!, width: nums[2]! }
    } else if (args.length > 0) {
      return { text: 'mandel: takes "close", or cx cy width (three numbers)' }
    }
    shown = true
    await $.ui.open({ id: PANE, title: `mandel ${view.cx} ${view.cy} ${view.width}`, rows: 30 })
    $.ui.invalidate('ui.render')
    return { text: `mandel: center (${view.cx}, ${view.cy}), width ${view.width}` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Image } = await $.ui.resolve(e)
    if (!shown || e.surface !== 'terminal') return <Box />
    const { columns, rows } = paneSize(e)
    const { rgba, width, height } = paint(columns, rows)
    return (
      <Box>
        <Image
          source={{ rgba, width, height }}
          columns={columns}
          rows={rows}
          alt={`Mandelbrot at (${view.cx}, ${view.cy}), width ${view.width}`}
        />
      </Box>
    )
  })
}
