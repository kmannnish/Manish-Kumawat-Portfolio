export type CopyMap = Record<string, string>

/**
 * Resolves a user-facing string by dotted key from the copy map.
 * Falls back safely to `fallback` if the key is missing or empty.
 *
 * CLAUDE.md Law #1: No hardcoded user-facing strings.
 * Every visible string resolves from the copy table via t(map, 'key', fallback).
 */
export function t(
  map: CopyMap | null | undefined,
  key: string,
  fallback: string = ''
): string {
  if (!map) return fallback
  const value = map[key]
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  return value
}
