// Pre-initializes the Rapier physics WASM so the first card render never waits
// on physics. rapier3d-compat embeds its wasm as base64 — init() takes NO
// arguments (passing a URL triggers its deprecation warning).
//
// NOTE: rapier3d-compat 0.19.2 emits "using deprecated parameters for the
// initialization function" from inside its OWN base64 loader (it calls its
// internal init with the wasm bytes). It is unconditional and benign, so we
// filter exactly that one message — everything else still logs normally.
const RAPIER_BENIGN_WARN = 'using deprecated parameters for the initialization function'

if (typeof console !== 'undefined' && !console.__rapierFilter) {
  const originalWarn = console.warn
  console.warn = function (...args) {
    if (typeof args[0] === 'string' && args[0].includes(RAPIER_BENIGN_WARN)) return
    return originalWarn.apply(this, args)
  }
  console.__rapierFilter = true
}

let promise = null

export function ensureRapier() {
  if (promise) return promise
  promise = import('@dimforge/rapier3d-compat')
    .then((mod) => mod.init())
    .catch((err) => {
      promise = null
      throw err
    })
  return promise
}