/**
 * All data access lives in this directory.
 *
 * CLAUDE.md: "lib/queries/ — all data access. Never query inline in a
 * component." Components import a named function from here; each query module
 * owns its own table(s) and is re-exported below so call sites stay short.
 */

export * from './copy'
export * from './settings'
export * from './nav'
export * from './freshness'
export * from './trace'
export * from './projects'
export * from './sections'
export * from './tech'
export * from './posts'
export * from './testimonials'
export * from './media'
