import {
  getSections,
  getCopyMap,
  getSiteSettings,
  getTraceData,
  getPublishedProjects,
  getTechByCategory,
  getPublishedPosts,
  getTestimonials,
} from '@/lib/queries'
import { Hero } from '@/components/sections/Hero'
import { Trace } from '@/components/sections/Trace'
import { Work } from '@/components/sections/Work'
import { Design } from '@/components/sections/Design'
import { About } from '@/components/sections/About'
import { Skills } from '@/components/sections/Skills'
import { Writing } from '@/components/sections/Writing'
import { Testimonials } from '@/components/sections/Testimonials'
import { Contact } from '@/components/sections/Contact'

export default async function HomePage() {
  const [
    sections,
    copy,
    settings,
    traceData,
    projects,
    techGroups,
    posts,
    testimonials,
  ] = await Promise.all([
    getSections(),
    getCopyMap(),
    getSiteSettings(),
    getTraceData(),
    getPublishedProjects(),
    getTechByCategory(),
    getPublishedPosts(),
    getTestimonials(),
  ])

  // If database sections are returned, use them in ascending sort_order;
  // otherwise fallback to full default order so all sections render.
  const activeSections =
    sections.length > 0
      ? sections
      : [
          {
            id: 'hero',
            kind: 'hero' as const,
            sort_order: 0,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'trace',
            kind: 'trace' as const,
            sort_order: 1,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'work',
            kind: 'work' as const,
            sort_order: 2,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'design',
            kind: 'design' as const,
            sort_order: 3,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'testimonials',
            kind: 'testimonials' as const,
            sort_order: 4,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'about',
            kind: 'about' as const,
            sort_order: 5,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'skills',
            kind: 'skills' as const,
            sort_order: 6,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'writing',
            kind: 'writing' as const,
            sort_order: 7,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
          {
            id: 'contact',
            kind: 'contact' as const,
            sort_order: 8,
            is_visible: true,
            title: null,
            subtitle: null,
            config: {},
            updated_at: '',
          },
        ]

  return (
    <div className="space-y-16 lg:space-y-24">
      {activeSections.map((section) => {
        if (!section.is_visible) return null

        switch (section.kind) {
          case 'hero':
            return <Hero key={section.id} copy={copy} settings={settings} />
          case 'trace':
            return <Trace key={section.id} data={traceData} copy={copy} />
          case 'work':
            return <Work key={section.id} projects={projects} copy={copy} />
          case 'design':
            return <Design key={section.id} projects={projects} copy={copy} />
          case 'about':
            return <About key={section.id} copy={copy} settings={settings} />
          case 'skills':
            return <Skills key={section.id} groups={techGroups} copy={copy} />
          case 'writing':
            return <Writing key={section.id} posts={posts} copy={copy} />
          case 'testimonials':
            return (
              <Testimonials
                key={section.id}
                testimonials={testimonials}
                copy={copy}
              />
            )
          case 'contact':
            return <Contact key={section.id} copy={copy} settings={settings} />
          default:
            return null
        }
      })}
    </div>
  )
}
