/**
 * All data access lives in this directory.
 *
 * CLAUDE.md: "lib/queries/ — all data access. Never query inline in a
 * component." Components import a named function from here; each query module
 * owns its own table(s) and is re-exported below so call sites stay short.
 *
 * Nothing to export yet. The schema lands in S2; the first queries land in S3
 * (the copy map, nav_items, site_settings).
 *
 * Note: this is a comment-only file rather than the empty directory the
 * roadmap asks for, because git does not track empty directories.
 */
export {}
