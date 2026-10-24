'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

export interface GalleryMediaItem {
  id: string
  url: string
  alt: string
  caption?: string | null
  width?: number | null
  height?: number | null
  placeholder?: string | null
  role?: string
  sort_order: number
}

interface ProjectGalleryProps {
  media: GalleryMediaItem[]
  projectTitle: string
  projectUrl?: string
}

export function ProjectGallery({ media, projectTitle, projectUrl }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'showcase' | 'grid'>('showcase')
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Guard against empty media
  if (!media || media.length === 0) return null

  const activeItem = media[activeIndex] || media[0]
  const lightboxItem = media[lightboxIndex] || media[0]

  // Clean URL badge for browser chrome
  const displayUrl = projectUrl
    ? projectUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'production.internal'

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
  }, [media.length])

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
  }, [media.length])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'ArrowRight') nextImage()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen, prevImage, nextImage])

  return (
    <section aria-label="Project media gallery" className="mt-16 pt-10 border-t border-rule max-w-5xl">
      {/* Gallery Section Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-h3 font-medium text-ink tracking-tight">
            Interface &amp; System Architecture
          </h2>
          <p className="text-xs text-graphite font-display mt-0.5">
            Key operational views, workflows, and production interfaces ({media.length} screens)
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xs bg-rule/30 border border-rule self-start sm:self-auto text-xs font-display">
          <button
            type="button"
            onClick={() => setViewMode('showcase')}
            className={`px-3 py-1 rounded-xs transition-all cursor-pointer ${
              viewMode === 'showcase'
                ? 'bg-paper text-ink font-medium shadow-xs border border-rule/60'
                : 'text-graphite hover:text-ink'
            }`}
          >
            Showcase
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1 rounded-xs transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-paper text-ink font-medium shadow-xs border border-rule/60'
                : 'text-graphite hover:text-ink'
            }`}
          >
            All Screens ({media.length})
          </button>
        </div>
      </div>

      {/* ================= SHOWCASE VIEW ================= */}
      {viewMode === 'showcase' && (
        <div className="space-y-5">
          {/* Main Browser Mockup Frame */}
          <div className="overflow-hidden rounded-xs border border-rule bg-paper shadow-xs">
            {/* Browser Chrome Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-rule/30 border-b border-rule/80 text-xs text-graphite">
              <div className="flex items-center gap-2">
                {/* Traffic dots */}
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rule-strong/40 inline-block" />
                  <span className="size-2.5 rounded-full bg-rule-strong/40 inline-block" />
                  <span className="size-2.5 rounded-full bg-rule-strong/40 inline-block" />
                </div>
                {/* URL pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-0.5 rounded-xs bg-paper/90 border border-rule/60 text-graphite font-display text-[11px] tabular-nums">
                  <span className="text-[10px] text-graphite/70">🔒</span>
                  <span className="truncate max-w-[280px]">{displayUrl}</span>
                </div>
              </div>

              {/* Status and Expand */}
              <div className="flex items-center gap-3 font-display text-[11px]">
                <span className="tabular-nums text-graphite">
                  {activeIndex + 1} of {media.length}
                </span>
                <button
                  type="button"
                  onClick={() => openLightbox(activeIndex)}
                  className="inline-flex items-center gap-1 text-ink hover:text-signal transition-colors cursor-pointer"
                  title="View full resolution"
                >
                  <span>Expand ↗</span>
                </button>
              </div>
            </div>

            {/* Featured Image Display with Navigation Overlay */}
            <div className="relative group/viewport bg-rule/10 aspect-16/10 flex items-center justify-center overflow-hidden">
              <button
                type="button"
                onClick={() => openLightbox(activeIndex)}
                className="w-full h-full cursor-zoom-in block text-left"
                aria-label={`Inspect full resolution: ${activeItem.alt}`}
              >
                <Image
                  src={activeItem.url}
                  alt={activeItem.alt || projectTitle}
                  width={activeItem.width || 1920}
                  height={activeItem.height || 1200}
                  placeholder={activeItem.placeholder ? 'blur' : 'empty'}
                  blurDataURL={activeItem.placeholder || undefined}
                  className="w-full h-full object-contain"
                  priority
                />
              </button>

              {/* Left arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1))
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-xs bg-ink/75 hover:bg-ink text-paper flex items-center justify-center opacity-0 group-hover/viewport:opacity-100 transition-opacity cursor-pointer shadow-xs focus-visible:opacity-100"
                aria-label="Previous screenshot"
              >
                ←
              </button>

              {/* Right arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0))
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-xs bg-ink/75 hover:bg-ink text-paper flex items-center justify-center opacity-0 group-hover/viewport:opacity-100 transition-opacity cursor-pointer shadow-xs focus-visible:opacity-100"
                aria-label="Next screenshot"
              >
                →
              </button>
            </div>

            {/* Active Caption Bar */}
            {activeItem.caption && (
              <div className="px-4 py-3 bg-rule/15 border-t border-rule/60 flex items-start justify-between gap-4">
                <p className="text-xs text-ink/90 font-display leading-relaxed max-w-prose">
                  {activeItem.caption}
                </p>
                <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-xs bg-rule/40 border border-rule text-graphite font-display">
                  Screen {activeIndex + 1}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Thumbnail Rail */}
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-graphite font-display">
              Select screen ({media.length} total)
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {media.map((item, idx) => {
                const isActive = idx === activeIndex
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative aspect-16/10 rounded-xs overflow-hidden border transition-all text-left cursor-pointer ${
                      isActive
                        ? 'border-signal ring-2 ring-signal/40 bg-signal/5'
                        : 'border-rule/80 hover:border-rule-strong bg-rule/20 opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Switch to screen ${idx + 1}`}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt}
                      width={240}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className={`absolute bottom-0 inset-x-0 text-[9px] font-display tabular-nums text-center py-0.5 px-1 truncate ${
                        isActive
                          ? 'bg-signal text-white font-medium'
                          : 'bg-ink/70 text-paper font-normal'
                      }`}
                    >
                      {idx + 1}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= GRID VIEW ================= */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {media.map((item, idx) => (
            <figure
              key={item.id || idx}
              className="group/card rounded-xs border border-rule bg-paper overflow-hidden transition-all hover:border-rule-strong hover:shadow-xs flex flex-col"
            >
              {/* Mini chrome header */}
              <div className="px-3 py-1.5 bg-rule/30 border-b border-rule flex items-center justify-between text-[11px] text-graphite font-display">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-rule-strong/40" />
                  <span className="size-2 rounded-full bg-rule-strong/40" />
                  <span className="size-2 rounded-full bg-rule-strong/40" />
                  <span className="ml-1 text-[10px] text-graphite">Screen {idx + 1}</span>
                </div>
                <button
                  type="button"
                  onClick={() => openLightbox(idx)}
                  className="text-graphite hover:text-signal transition-colors cursor-pointer"
                >
                  Expand ↗
                </button>
              </div>

              {/* Image */}
              <button
                type="button"
                onClick={() => openLightbox(idx)}
                className="relative block aspect-16/10 bg-rule/10 overflow-hidden cursor-zoom-in text-left"
                aria-label={`Inspect screen ${idx + 1}`}
              >
                <Image
                  src={item.url}
                  alt={item.alt || projectTitle}
                  width={item.width || 1200}
                  height={item.height || 800}
                  placeholder={item.placeholder ? 'blur' : 'empty'}
                  blurDataURL={item.placeholder || undefined}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover/card:scale-[1.01]"
                />
              </button>

              {/* Caption */}
              {item.caption && (
                <figcaption className="p-3 bg-rule/10 border-t border-rule/50 text-xs text-ink/90 font-display leading-relaxed flex-1">
                  {item.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      {/* ================= FULLSCREEN LIGHTBOX MODAL ================= */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="High resolution image inspection"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-ink/95 backdrop-blur-md p-4 sm:p-6 text-paper animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Lightbox Topbar */}
          <div
            className="flex items-center justify-between pb-3 border-b border-paper/15 text-xs font-display"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium text-paper">{projectTitle}</span>
              <span className="text-paper/60 tabular-nums">
                ({lightboxIndex + 1} of {media.length})
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline text-paper/50 text-[11px]">
                Use ← / → keys to navigate · Esc to close
              </span>
              <button
                type="button"
                onClick={closeLightbox}
                className="px-2.5 py-1 rounded-xs bg-paper/10 hover:bg-paper/20 text-paper font-medium transition-colors cursor-pointer"
              >
                Close ✕
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 size-12 rounded-full bg-paper/10 hover:bg-paper/25 text-paper flex items-center justify-center text-xl transition-colors z-10 cursor-pointer"
              aria-label="Previous image"
            >
              ←
            </button>

            {/* High-res Image */}
            <div className="relative max-w-full max-h-[82vh] overflow-hidden rounded-xs shadow-2xl border border-paper/20">
              <Image
                src={lightboxItem.url}
                alt={lightboxItem.alt || projectTitle}
                width={lightboxItem.width || 2880}
                height={lightboxItem.height || 1800}
                className="max-h-[82vh] w-auto h-auto object-contain"
                priority
              />
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 size-12 rounded-full bg-paper/10 hover:bg-paper/25 text-paper flex items-center justify-center text-xl transition-colors z-10 cursor-pointer"
              aria-label="Next image"
            >
              →
            </button>
          </div>

          {/* Lightbox Caption Footer */}
          {lightboxItem.caption && (
            <div
              className="pt-2 text-center text-xs font-display text-paper/85 max-w-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {lightboxItem.caption}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
