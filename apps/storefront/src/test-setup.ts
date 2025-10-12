// RTL matchers (newer path)
import '@testing-library/jest-dom'

// Polyfill fetch if your CI/node lacks it
if (!(globalThis as any).fetch) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fetch, Headers, Request, Response } = require('whatwg-fetch')
  Object.assign(globalThis, { fetch, Headers, Request, Response })
}

// matchMedia (some UI expects it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
;(window as any).ResizeObserver = ResizeObserver

// IntersectionObserver
;(globalThis as any).IntersectionObserver = class {
  observe() { return null }
  unobserve() { return null }
  disconnect() { return null }
}

// Optional: quiet expected noisy logs from mocked failures
const originalError = console.error
console.error = (...args: any[]) => {
  const s = String(args[0] ?? '')
  if (s.includes('SupportAPI/agent failure') || s.includes('SupportAPI/order lookup failed')) return
  originalError(...args)
}
