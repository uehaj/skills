import type { Register } from 'claude-code'
import { imgCommand, registerImg } from './img.tsx'
import { mandelCommand, registerMandel } from './mandel.tsx'

export const register: Register = (on, options) => {
  // one session.start for the module: the engine refuses a second one without a matcher
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    for (const command of [imgCommand, mandelCommand]) {
      await $.command.register(command)
        .catch(err => $.ui.log(`playground: /${command.name} not registered: ${err}`))
    }
    return r
  })

  registerImg(on, options)
  registerMandel(on, options)
}
