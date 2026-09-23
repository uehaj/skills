/* @jsx h */
import type { Register } from 'claude-code'
import { paneSize } from './pane.ts'

const PANE = 'img'
let file: string | null = null

export const imgCommand = {
  name: 'img',
  description: 'Show a PNG in a pane',
  argumentHint: '</abs/path.png> | close',
  immediate: true,
}

export const registerImg: Register = (on) => {
  on('command.run', { command: 'img' }, async ($, e) => {
    const arg = e.args.trim()
    if (!arg || arg === 'close') {
      file = null
      await $.ui.close({ id: PANE })
      return { text: 'img: closed' }
    }
    if (!arg.startsWith('/')) return { text: 'img: absolute path required' }
    if (!(await $.fs.exists(arg))) return { text: `img: not found: ${arg}` }
    file = arg
    await $.ui.open({ id: PANE, title: arg.split('/').pop() ?? 'img', rows: 30 })
    $.ui.invalidate('ui.render')
    return { text: `img: ${arg}` }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Image } = await $.ui.resolve(e)
    if (!file || e.surface !== 'terminal') return <Box />
    const { columns, rows } = paneSize(e)
    // PNG only; a JPEG or WebP has to be decoded to { png } or { rgba } bytes first
    return (
      <Box>
        <Image source={{ file, format: 'png' }} columns={columns} rows={rows} alt={file} />
      </Box>
    )
  })
}
