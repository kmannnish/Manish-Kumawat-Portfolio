# Portfolio — Manish Kumawat

Planning documents for a fully dynamic portfolio: one public site, one admin panel with total content control, nothing hardcoded.

**Nothing has been coded yet.** This is the plan. Start with `docs/04-build-roadmap.md`.

## What's here

| File | What it's for | Read it when |
|---|---|---|
| `CLAUDE.md` | Project instructions, auto-loaded by Claude Code every session | Never manually — it loads itself |
| `docs/01-reference-teardown.md` | What to take from your five reference sites, and what to skip | Deciding whether a pattern is worth it |
| `docs/02-design-direction.md` | The design system: tokens, type, layout, motion, banned patterns | Building any UI |
| `docs/03-data-model.md` | Full Postgres schema, RLS policies, storage, real costs | Touching the database |
| `docs/04-build-roadmap.md` | 15 sessions with a copy-paste prompt and done-check each (two split across two sittings, so ~17 in practice) | **Start here** |
| `docs/05-claude-code-playbook.md` | How to run the build without burning tokens | Before session 1, then skim again at session 5 |

## Decisions already made

Next.js App Router + Supabase + Resend + Vercel. Public site built first against seeded data, admin panel second. Design direction is "Instrument" — a light, instrumentation-informed system whose one bold element is a **deployment trace chart** rendering your experience as duration bars on a shared time axis.

Running cost is about **$12/year** — the domain. Everything else sits inside free tiers. Two things could change that: Vercel's Hobby tier is non-commercial, and self-hosted video will outgrow Supabase's storage. Both are covered in `docs/03-data-model.md` §8.

## One caveat worth knowing

**The playbook's command syntax is unverified.** The session that wrote `docs/05-claude-code-playbook.md` had no network access, so items marked **(verify)** should be checked against `/help` before you rely on them.

The reference teardown, by contrast, **is** measured. All five sites were saved via "Webpage, Complete" into `docs/references/` and re-read from the markup on 2026-10-02; that pass contradicted five claims in the original memory-written draft, and the corrections are listed at the end of `docs/01-reference-teardown.md`. Two gaps remain by omission rather than error: `brittanychiang.com/archive` and `lynnandtonic.com/about/` are separate URLs and weren't captured, so claims about those two pages are flagged in place. Save them into the matching `docs/references/` subfolder if you want them settled.

## First move

```
claude
```

Then:

> Read docs/04-build-roadmap.md and do S1. Plan before editing anything.
