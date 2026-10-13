-- ============================================================
-- seed.sql
-- Realistic portfolio content.
-- Run after all migrations via `supabase db reset`.
--
-- ADMIN: uncomment the admins insert once you have signed up and
-- confirmed your auth.users UUID (check the Supabase dashboard).
-- ============================================================

-- ── site_settings ────────────────────────────────────────────────────────────
-- Exactly one row. No more, no less.
insert into site_settings (
  owner_name, role_title, tagline, currently, location,
  contact_email, seo_title, seo_description, social_links
) values (
  'Manish Kumawat',
  'Forward Deployed AI Engineer & Designer',
  'I build tools that solve real problems and design things people remember.',
  'Building AI-powered automation tools and shipping live products for clients',
  'India',
  'manish@example.com',
  'Manish Kumawat — Forward Deployed AI Engineer & Designer',
  'I solve business problems with AI, code, and design. Live projects across industries — from logistics to creative tools.',
  '[{"label":"GitHub","url":"https://github.com/manishk","icon":"github"},{"label":"LinkedIn","url":"https://linkedin.com/in/manishk","icon":"linkedin"}]'
);

-- ── sections ────────────────────────────────────────────────────────────────
-- The page composer. Kind 'design' renders the graphic-design gallery (S4).
insert into sections (kind, title, subtitle, sort_order, is_visible, config) values
  ('hero',        null,                     null,                           0,  true,  '{}'),
  ('trace',       null,                     null,                           1,  true,  '{}'),
  ('work',        'Work',                   'Products that run in production', 2, true, '{}'),
  ('design',      'Design',                 'Graphic work, print & motion',    3, true, '{}'),
  ('testimonials','Testimonials',           null,                           4,  true,  '{}'),
  ('contact',     null,                     null,                           5,  true,  '{}');

-- ── copy ────────────────────────────────────────────────────────────────────
-- Every user-facing string. Never hardcode — resolve via t(map, 'key', fallback).
insert into copy (key, value, kind, group_name, label) values

  -- Nav
  ('nav.work',         'Work',        'text', 'nav',         'Work'),
  ('nav.design',       'Design',      'text', 'nav',         'Design'),
  ('nav.archive',      'Archive',     'text', 'nav',         'Archive'),
  ('nav.contact',      'Contact',     'text', 'nav',         'Contact'),

  -- Hero (resolved from site_settings, but copy keys exist for overrides)
  ('hero.cta.work',    'See my work',   'text', 'hero', 'CTA — Work'),
  ('hero.cta.contact', 'Get in touch',  'text', 'hero', 'CTA — Contact'),

  -- Trace chart
  ('trace.label.now',  'Now',         'text', 'trace', 'Trace — Now label'),
  ('trace.label.none', 'No active role','text','trace', 'Trace — no active role'),

  -- Work index
  ('work.empty',       'No published projects yet.', 'text', 'work', 'Empty state'),
  ('work.index.label', 'Selected work', 'text', 'work', 'Section eyebrow'),
  ('work.cta.all',     'View all projects',         'text', 'work', 'CTA'),
  ('work.cta.case',   'Read case study',            'text', 'work', 'CTA — case study'),
  ('work.metrics.see', 'See metrics',  'text', 'work', 'Metrics toggle label'),
  ('work.metrics.hide', 'Hide metrics', 'text', 'work', 'Metrics toggle label'),

  -- Design gallery
  ('design.empty',     'No design work published yet.', 'text', 'design', 'Empty state'),
  ('design.filter.all','All',        'text', 'design', 'Filter — all'),
  ('design.filter.print','Print',     'text', 'design', 'Filter — print'),
  ('design.filter.stage','Stage',    'text', 'design', 'Filter — stage'),
  ('design.filter.video','Video',    'text', 'design', 'Filter — video'),
  ('design.filter.mockup','Mockups', 'text', 'design', 'Filter — mockups'),

  -- Project detail
  ('project.problem.label',   'The problem',   'text', 'project', 'Problem label'),
  ('project.approach.label',  'The approach',  'text', 'project', 'Approach label'),
  ('project.outcome.label',   'The outcome',   'text', 'project', 'Outcome label'),
  ('project.metrics.label',    'Impact',        'text', 'project', 'Metrics label'),
  ('project.links.label',     'Links',         'text', 'project', 'Links label'),
  ('project.cta.live',        'View live',     'text', 'project', 'CTA — live'),
  ('project.cta.code',        'View source',   'text', 'project', 'CTA — source'),
  ('project.back',            '← All work',    'text', 'project', 'Back link'),

  -- Archive
  ('archive.title',   'Archive',     'text', 'archive', 'Archive page title'),
  ('archive.empty',   'Nothing archived yet.', 'text', 'archive', 'Empty state'),

  -- Testimonials
  ('testimonials.cta', 'Read more', 'text', 'testimonials', 'CTA — more testimonials'),

  -- Contact
  ('contact.form.name.label',       'Your name',    'text', 'contact', 'Form — name'),
  ('contact.form.name.placeholder', 'Priya Sharma', 'text', 'contact', 'Form — name placeholder'),
  ('contact.form.company.label',    'Company',      'text', 'contact', 'Form — company'),
  ('contact.form.company.placeholder', 'Acme Corp',  'text', 'contact', 'Form — company placeholder'),
  ('contact.form.email.label',      'Email',        'text', 'contact', 'Form — email'),
  ('contact.form.email.placeholder','priya@acme.com','text','contact', 'Form — email placeholder'),
  ('contact.form.message.label',    'Message',      'text', 'contact', 'Form — message'),
  ('contact.form.message.placeholder','Tell me about your project…','text','contact','Form — message placeholder'),
  ('contact.form.submit',           'Send message', 'text', 'contact', 'Form — submit'),
  ('contact.form.success',          'Message sent. I''ll reply within a day or two.', 'text', 'contact', 'Success message'),
  ('contact.form.error',           'Something went wrong. Try again or email directly.', 'text', 'contact', 'Error message'),
  ('contact.form.rate_limit',      'Too many requests. Please wait a moment and try again.', 'text', 'contact', 'Rate limit message'),
  ('contact.cta.github',           'GitHub',        'text', 'contact', 'Social — GitHub'),
  ('contact.cta.linkedin',         'LinkedIn',      'text', 'contact', 'Social — LinkedIn'),

  -- Footer
  ('footer.last_updated', 'Last updated', 'text', 'footer', 'Last updated label'),
  ('footer.built_with',   'Built with Next.js & Supabase', 'text', 'footer', 'Built with'),

  -- About
  ('about.title',   'About',   'text', 'about', 'About section title'),
  ('about.cta.resume','Download résumé', 'text', 'about', 'CTA — résumé');

-- ── tech ────────────────────────────────────────────────────────────────────
-- Proficiency: 1 = beginner, 5 = expert.
insert into tech (name, slug, category, proficiency, is_featured, sort_order) values
  ('TypeScript',      'typescript',      'language',   5, true,  1),
  ('Python',          'python',          'language',   5, true,  2),
  ('Next.js',         'nextjs',          'framework',  5, true,  3),
  ('React',           'react',           'framework',  5, true,  4),
  ('Tailwind CSS',    'tailwindcss',      'framework',  5, true,  5),
  ('Supabase',       'supabase',         'infra',      4, true,  6),
  ('PostgreSQL',      'postgresql',       'infra',      4, false, 7),
  ('Node.js',         'nodejs',           'infra',      4, false, 8),
  ('OpenAI',          'openai',           'model',      5, true,  9),
  ('Claude',          'claude',           'model',      4, true, 10),
  ('Photoshop',       'photoshop',        'design',     5, true, 11),
  ('Illustrator',     'illustrator',      'design',     5, true, 12),
  ('CorelDraw',       'coreldraw',        'design',     5, true, 13),
  ('Figma',           'figma',            'design',     4, false,14),
  ('DaVinci Resolve', 'davinci-resolve',  'design',     4, true, 15),
  ('After Effects',   'after-effects',    'design',     4, true, 16),
  ('Premiere Pro',    'premiere-pro',     'design',     4, true, 17),
  ('Docker',          'docker',           'infra',      3, false,18),
  ('Git',             'git',              'tooling',    5, false,19);

-- ── experience ───────────────────────────────────────────────────────────────
-- Overlapping start dates so the trace chart has something to render.
insert into experience (organization, role, location, employment_type, started_on, ended_on, summary, highlights, is_visible, sort_order) values
  (
    'Freelance',
    'Forward Deployed AI Engineer & Designer',
    'Remote',
    'contract',
    '2024-01-01',
    null,
    'Building AI-powered tools, websites, and automation for businesses across industries. End-to-end: problem framing, design, development, and deployment.',
    '[{"text":"Shipped 12+ live products used by real businesses"},{"text":"Reduced client manual workload by 60–80% through AI automation"},{"text":"Designed and developed full brand identities for 4 clients"}]',
    true,
    0
  ),
  (
    'Tech Startup (name withheld)',
    'Full-Stack Developer',
    'Remote',
    'contract',
    '2023-06-01',
    '2023-12-31',
    'Built and maintained internal tooling and customer-facing features for a B2B SaaS product.',
    '[{"text":"Rebuilt the dashboard in Next.js, cutting load time by 40%"},{"text":"Added AI-assisted search that improved findability by 3×"}]',
    true,
    1
  ),
  (
    'Design Studio',
    'Graphic Designer & Video Editor',
    'Remote',
    'contract',
    '2022-03-01',
    '2023-05-31',
    'Produced print, digital, and video design work for a design agency. Clients spanned retail, hospitality, and events.',
    '[{"text":"Delivered 30+ print projects: brochures, banners, stage designs"},{"text":"Edited 50+ videos including promotional reels and event coverage"}]',
    true,
    2
  );

-- ── projects ────────────────────────────────────────────────────────────────
-- All four must have metrics with exactly one is_headline: true.
-- `show_in_design_section` is true when the project also produced design assets.

-- Project 1: Engineering project (show_in_design_section = false)
insert into projects (
  slug, title, summary, body, role, started_on, ended_on,
  status, is_featured, show_in_design_section, sort_order,
  problem, approach, outcome, metrics, links
) values (
  'logistics-ai-agent',
  'Logistics AI Agent',
  'An AI agent that ingests raw shipment data and produces structured daily reports, reducing a logistics team''s manual effort by 80%.',
  '## Background\nA mid-size logistics company was spending 3 hours every morning compiling PDF reports from spreadsheets. The team needed a tool that could read incoming data and produce a clean, actionable report — without them having to do it by hand.\n\n## What I built\nA Next.js dashboard backed by a Python agent that uses structured tool-calling to navigate the data, reason over it, and produce the report. The agent runs on a schedule via a cron job and emails the report at 7am.\n\n## Technical choices\n- **Frontend:** Next.js + Tailwind, deployed on Vercel\n- **Agent:** Python, OpenAI function-calling API, stateless runs\n- **Storage:** Supabase for report history\n- **Email:** Resend for one-click delivery',
  'Engineer & Designer',
  '2024-09-01',
  '2024-11-30',
  'published',
  true,
  false,
  0,
  'Logistics teams spent 3+ hours each morning manually compiling shipment reports from scattered spreadsheets.',
  'A Python agent reads incoming CSV data, reasons over it using the OpenAI function-calling API, and produces a structured daily report — no human in the loop.',
  'The tool now runs autonomously every morning, delivering a formatted report to the team at 7am. Manual effort dropped from 3 hours to under 20 minutes of review.',
  '[{"label":"p95 latency","before":"4.2s","after":"610ms","unit":"ms","is_headline":true},{"label":"daily reports","before":"0","after":"22","unit":"reports/day","is_headline":false},{"label":"manual effort","before":"180","after":"20","unit":"min/day","is_headline":false}]',
  '[{"label":"Live product","url":"https://example.com","kind":"live"},{"label":"GitHub","url":"https://github.com/manishk/logistics-agent","kind":"code"}]'
);

-- Project 2: Engineering + design (show_in_design_section = true)
insert into projects (
  slug, title, summary, body, role, started_on, ended_on,
  status, is_featured, show_in_design_section, sort_order,
  problem, approach, outcome, metrics, links
) values (
  'retail-mockup-generator',
  'Retail Mockup Generator',
  'A browser tool that applies product photography to mockup templates in seconds, replacing days of Photoshop work for small retailers.',
  '## The problem\nSmall retailers launching online stores needed product photos on lifestyle backgrounds — but hiring a photographer or spending hours in Photoshop was out of reach.\n\n## The solution\nA web tool that lets the user upload a product photo, pick a mockup template (clothing, packaging, accessories), and download a finished composite. The composite is generated via a blend of clipping paths and perspective transform, all client-side.\n\n## Design work\nEvery mockup template was designed from scratch in Photoshop and Illustrator. The tool''s UI was designed to match the brand identity created for the project.',
  'Engineer & Designer',
  '2024-06-01',
  '2024-08-15',
  'published',
  true,
  true,
  1,
  'Small retailers needed product-on-mockup images but had no budget for a photographer and no time for Photoshop.',
  'A client-side web tool using Canvas API for compositing, with a library of original mockup templates designed specifically for this use case.',
  'Retailers generate mockup images in under 60 seconds. Average time to produce a launch-ready product photo dropped from 2 days to under 5 minutes.',
  '[{"label":"avg generation time","before":"2880","after":"55","unit":"min","is_headline":true},{"label":"retailers using tool","before":"0","after":"38","unit":"active users","is_headline":false},{"label":"mockup templates","before":"0","after":"24","unit":"templates","is_headline":false}]',
  '[{"label":"Live tool","url":"https://example.com/mockup","kind":"live"},{"label":"GitHub","url":"https://github.com/manishk/mockup-gen","kind":"code"}]'
);

-- Project 3: Engineering project
insert into projects (
  slug, title, summary, body, role, started_on, ended_on,
  status, is_featured, show_in_design_section, sort_order,
  problem, approach, outcome, metrics, links
) values (
  'content-automation-pipeline',
  'Content Automation Pipeline',
  'An AI pipeline that ingests product data from multiple sources, enriches it with descriptions, and publishes it to an e-commerce platform — cutting publishing time from 4 hours to 8 minutes.',
  '## Context\nAn e-commerce team was manually copying product data from supplier spreadsheets into their CMS. With hundreds of SKUs and weekly supplier updates, this was a full-time job for one person.\n\n## What I built\nA Node.js pipeline that pulls data from the supplier API, uses an LLM to generate enriched descriptions, validates everything against a schema, and pushes to the CMS via its REST API. A lightweight admin UI lets the team review before publishing.\n\n## Outcome\nThe pipeline now handles the full workflow. The team member previously doing data entry now focuses on merchandising strategy.',
  'Engineer',
  '2024-03-01',
  '2024-05-30',
  'published',
  false,
  false,
  2,
  'A single team member spent 4+ hours per week manually entering and formatting product data from supplier spreadsheets into the CMS.',
  'A scheduled pipeline that pulls raw supplier data, uses an LLM to generate enriched product descriptions, validates against a defined schema, and publishes to the CMS via its API.',
  'Publishing time dropped from 4 hours per week to 8 minutes. The team member now reviews and approves rather than typing — and the pipeline handles the weekly supplier updates automatically.',
  '[{"label":"publishing time","before":"240","after":"8","unit":"min/week","is_headline":true},{"label":"SKUs processed","before":"0","after":"847","unit":"per run","is_headline":false},{"label":"error rate","before":"12","after":"0","unit":"%","is_headline":false}]',
  '[{"label":"Live product","url":"https://example.com","kind":"live"},{"label":"GitHub","url":"https://github.com/manishk/content-pipeline","kind":"code"}]'
);

-- Project 4: Engineering + design
insert into projects (
  slug, title, summary, body, role, started_on, ended_on,
  status, is_featured, show_in_design_section, sort_order,
  problem, approach, outcome, metrics, links
) values (
  'event-stage-design-system',
  'Event Stage Design System',
  'A library of stage design templates for corporate events — built in Illustrator and delivered as print-ready PDFs, used by an event management company for 15+ events.',
  '## Brief\nAn event management company needed consistent, high-quality stage designs they could adapt quickly for different venues and clients. Previous designs were ad-hoc, inconsistent, and took days to produce.\n\n## What I delivered\nA design system of modular stage templates built in Illustrator — backdrop compositions, LED screen layouts, entrance arches, and podium layouts. Each module could be combined and adapted without starting from scratch.\n\n## Design assets\nIncluded: 8 master templates, 40+ component modules, a usage guide, and print-ready PDF exports at multiple resolution scales.\n\n## Outcome\nThe design system enabled the team to produce event-ready stage visuals in under 4 hours, down from 2–3 days.',
  'Designer & Engineer',
  '2024-01-15',
  '2024-04-30',
  'published',
  false,
  true,
  3,
  'Event designs were being created from scratch for each project, taking 2–3 days and producing inconsistent results across the team.',
  'A modular design system in Illustrator: component-based stage modules that can be combined, recoloured, and adapted to any venue in hours.',
  'Design production time dropped from 2–3 days to under 4 hours. The system was used for 15+ events in the first year.',
  '[{"label":"production time","before":"2880","after":"240","unit":"min","is_headline":true},{"label":"events using system","before":"0","after":"15","unit":"events","is_headline":false},{"label":"templates","before":"0","after":"48","unit":"components","is_headline":false}]',
  '[{"label":"Design case study","url":"https://example.com/stage-design","kind":"live"}]'
);

-- ── project_tech ─────────────────────────────────────────────────────────────
-- Map tech slugs to project slugs. Tech IDs must match real inserts above.
-- Project 1: TypeScript, Python, Next.js, Tailwind, Supabase, OpenAI
insert into project_tech (project_id, tech_id)
select p.id, t.id
from projects p, tech t
where p.slug = 'logistics-ai-agent'
  and t.slug in ('typescript','python','nextjs','tailwindcss','supabase','openai');

-- Project 2: TypeScript, Next.js, Tailwind, Photoshop, Illustrator
insert into project_tech (project_id, tech_id)
select p.id, t.id
from projects p, tech t
where p.slug = 'retail-mockup-generator'
  and t.slug in ('typescript','nextjs','tailwindcss','photoshop','illustrator');

-- Project 3: TypeScript, Node.js, OpenAI
insert into project_tech (project_id, tech_id)
select p.id, t.id
from projects p, tech t
where p.slug = 'content-automation-pipeline'
  and t.slug in ('typescript','nodejs','openai');

-- Project 4: Illustrator, Photoshop, After Effects
insert into project_tech (project_id, tech_id)
select p.id, t.id
from projects p, tech t
where p.slug = 'event-stage-design-system'
  and t.slug in ('illustrator','photoshop','after-effects');

-- ── media ────────────────────────────────────────────────────────────────────
-- Design work. tool_tags are the canonical names for the design gallery.
-- `caption` gives context a designer viewer can read.
-- video_url is used for hosted embeds (Supabase storage is not a CDN).
-- kind 'mockup'/'stage'/'poster'/'print' come from the extended media_kind enum.
-- Media rows here are placeholders — replace path/bucket/width/height with real
-- uploads once the storage bucket is live.

-- Stage design photography (placeholder rows — replace with real assets)
insert into media (bucket, path, kind, alt_text, caption, tool_tags, width, height, mime_type) values
  ('media', 'design/stage/01.jpg', 'stage', 'Corporate event stage with LED backdrop and modular panels', 'Main stage composition — LED backdrop with abstract geometric panels. Used for annual product launch, 800-seat venue.', ARRAY['Photoshop','Illustrator'], 1920, 1080, 'image/jpeg'),
  ('media', 'design/stage/02.jpg', 'stage', 'Conference stage with asymmetric lighting rig', 'Conference keynote stage — asymmetric lighting composition. Used for tech conference, 3-day event.', ARRAY['Photoshop','Illustrator'], 1920, 1080, 'image/jpeg'),
  ('media', 'design/stage/03.jpg', 'stage', 'Exhibition stand with interactive product display area', 'Exhibition design — modular stand with interactive display zones. Trade show, 200sqm footprint.', ARRAY['Photoshop','Illustrator'], 1920, 1080, 'image/jpeg');

-- Poster design (placeholder rows)
insert into media (bucket, path, kind, alt_text, caption, tool_tags, width, height, mime_type) values
  ('media', 'design/poster/01.jpg', 'poster', 'Event poster — music festival, A2 portrait format', 'Music festival poster — A2 portrait. Bold type treatment, photographic overlay. Edition of 500 printed.', ARRAY['Photoshop','Illustrator'], 1191, 1684, 'image/jpeg'),
  ('media', 'design/poster/02.jpg', 'poster', 'Product launch poster — tech brand, A3 landscape', 'Product launch poster — A3 landscape, tech brand identity. Used for social and print.', ARRAY['Photoshop','Illustrator'], 1754, 1240, 'image/jpeg'),
  ('media', 'design/poster/03.jpg', 'poster', 'Corporate annual report cover, A4 format', 'Annual report cover — editorial layout, serif headline type. Clean, restrained, print-ready.', ARRAY['Illustrator'], 993, 1404, 'image/jpeg');

-- Print collateral (placeholder rows)
insert into media (bucket, path, kind, alt_text, caption, tool_tags, width, height, mime_type) values
  ('media', 'design/print/01.jpg', 'print', 'Brochure cover — interior design studio, trifold A4', 'Trifold brochure — interior design studio client. Photography-led, architectural typography.', ARRAY['Illustrator','Photoshop'], 2480, 3508, 'image/jpeg'),
  ('media', 'design/print/02.jpg', 'print', 'Product catalog pages — lifestyle brand, 24-page saddle stitch', '24-page catalog — lifestyle brand product photography, minimal layout. Saddle-stitch binding.', ARRAY['Illustrator','Photoshop'], 2480, 3508, 'image/jpeg'),
  ('media', 'design/print/03.jpg', 'print', 'Banner set — exhibition pull-up stands, 3 designs', 'Exhibition banner set — 3 pull-up stand designs, 85×200cm each. Used across 4 trade shows.', ARRAY['Illustrator','Photoshop'], 1191, 3543, 'image/jpeg');

-- Mockups (placeholder rows)
insert into media (bucket, path, kind, alt_text, caption, tool_tags, width, height, mime_type) values
  ('media', 'design/mockup/01.jpg', 'mockup', 'T-shirt mockup — folded garment on neutral surface', 'Garment mockup — folded T-shirt. Used for e-commerce launch photography.', ARRAY['Photoshop','Illustrator'], 1920, 1440, 'image/jpeg'),
  ('media', 'design/mockup/02.jpg', 'mockup', 'Product packaging mockup — cosmetic box, 3角度', 'Packaging mockup — cosmetic box, three-angle composite. Client used this for Amazon listings.', ARRAY['Photoshop','Illustrator'], 1920, 1440, 'image/jpeg'),
  ('media', 'design/mockup/03.jpg', 'mockup', 'Brand collateral mockup — business card, letterhead, envelope', 'Brand collateral set mockup — business card, letterhead, envelope. Consistent paper stock and lighting.', ARRAY['Photoshop','Illustrator'], 1920, 1440, 'image/jpeg'),
  ('media', 'design/mockup/04.jpg', 'mockup', 'Device mockup — laptop and phone, app interface', 'Device mockup — laptop and phone showing app interface. Used for client pitch deck.', ARRAY['Photoshop','Illustrator'], 1920, 1440, 'image/jpeg');

-- Video clips (placeholder rows — video_url holds the embed URL)
insert into media (bucket, path, kind, alt_text, caption, tool_tags, width, height, duration_seconds, video_url, mime_type) values
  ('media', 'design/video/event-reel.mp4', 'video', 'Event highlight reel — 90 seconds, edited in DaVinci Resolve', 'Event highlight reel — 90 seconds. DaVinci Resolve colour grade, After Effects titles. Used as event follow-up and social content.', ARRAY['DaVinci Resolve','After Effects','Premiere Pro'], 1920, 1080, 90, 'https://www.youtube.com/watch?v=XXXXXXXXXXX', 'video/mp4'),
  ('media', 'design/video/promo-60s.mp4', 'video', 'Product promo — 60-second cut for Instagram and YouTube Shorts', '60-second product promo — fast-cut with motion graphics. Delivered in 16:9, 9:16, and 1:1 for platform适配.', ARRAY['Premiere Pro','After Effects'], 1920, 1080, 60, 'https://www.youtube.com/watch?v=XXXXXXXXXXX', 'video/mp4');

-- ── project_media ────────────────────────────────────────────────────────────
-- Associate media with projects (for projects that have show_in_design_section = true).
-- Use the placeholder media rows inserted above.

-- logistics-ai-agent: has a screenshot of the dashboard (placeholder)
insert into project_media (project_id, media_id, role, sort_order)
select p.id, m.id, 'gallery', 0
from projects p, media m
where p.slug = 'logistics-ai-agent'
  and m.path = 'design/mockup/04.jpg'  -- reuse the device mockup as a screenshot placeholder
limit 1;

-- retail-mockup-generator: has mockup previews
insert into project_media (project_id, media_id, role, sort_order)
select p.id, m.id, 'gallery', i
from projects p, media m
where p.slug = 'retail-mockup-generator'
  and m.kind = 'mockup'
order by m.path;

-- event-stage-design-system: has stage design photos
insert into project_media (project_id, media_id, role, sort_order)
select p.id, m.id, 'gallery', i
from projects p, media m
where p.slug = 'event-stage-design-system'
  and m.kind = 'stage'
order by m.path;

-- ── testimonials ─────────────────────────────────────────────────────────────
insert into testimonials (author_name, author_role, author_org, quote, is_visible, sort_order) values
  (
    'Rahul Mehta',
    'Operations Director',
    'Logistics firm (name withheld)',
    'Manish built an agent that runs every morning and has saved our team three hours a day. It just works — we had one brief call and then a finished product two weeks later.',
    true,
    0
  ),
  (
    'Priya Nair',
    'Founder',
    'E-commerce startup',
    'The mockup generator alone was worth the project. We went from spending days on product photography to having a tool that does it in minutes. The design sensibility throughout was exactly what we needed.',
    true,
    1
  ),
  (
    'Amit Shah',
    'Creative Director',
    'Event management company',
    'The stage design system transformed how we work. What used to take three days now takes four hours, and the quality is consistently higher. Manish understood the brief perfectly.',
    true,
    2
  );

-- ── nav_items ────────────────────────────────────────────────────────────────
insert into nav_items (label, href, sort_order, is_visible) values
  ('Work',    '/',       0, true),
  ('Design',  '/design', 1, true),
  ('Archive', '/archive',2, true),
  ('Contact', '/#contact', 3, true);

-- ── admins ──────────────────────────────────────────────────────────────────
-- Replace 'YOUR_AUTH_UUID_HERE' with your auth.users UUID from the Supabase
-- dashboard after you sign up and confirm your account.
-- insert into admins (user_id, email) values
--   ('YOUR_AUTH_UUID_HERE', 'manish@example.com');
