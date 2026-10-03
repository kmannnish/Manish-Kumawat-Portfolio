# Claude Code playbook — how to run this build cheaply

**Accuracy note.** This session had no network access, so I couldn't verify command names and config keys against current docs. Items marked **(verify)** are from memory and may have drifted — confirm with `/help`, `/config`, or the docs before depending on them. The *principles* don't drift; the syntax might.

---

## 1. The one thing to understand

A conversation is stateless. Every time you send a message, **the entire conversation so far is sent again**. Turn 40 costs far more than turn 1, because turn 40 carries turns 1 through 39 with it.

So cost doesn't grow with how much work you do. It grows with **how long a single session runs**. Two 20-turn sessions are dramatically cheaper than one 40-turn session doing identical work — and they usually produce better output, because the model isn't sifting a haystack of stale context to find what matters.

Everything below follows from that.

---

## 2. Habits, ranked by actual impact

### 1. `/clear` between tasks — by far the biggest lever

When a task is done, clear. Starting a fresh session is not wasteful; it's the single most effective thing you can do. `docs/04-build-roadmap.md` is already carved into fifteen one-session chunks for exactly this reason.

Signs you've overstayed: the model re-reads files it already read, "forgets" a decision from earlier, or starts suggesting things you explicitly ruled out. That's context saturation. Clear and restate.

### 2. `/compact` only when you genuinely need continuity

`/compact` summarises the conversation and continues. Useful mid-task when you're deep in something and don't want to lose thread. It still costs a full pass over the conversation to produce the summary, so it is *cheaper than continuing* but *more expensive than clearing*. Prefer `/clear`; reach for `/compact` when clearing would lose something you'd have to re-explain. It accepts a free-text instruction for what to preserve — **(verify)**.

### 3. Keep `CLAUDE.md` short, and don't edit it mid-session

`CLAUDE.md` is prepended to every request. A 500-line one is a tax on every turn for the rest of the project. The one in this repo stays under its own stated 120-line cap and holds only what's needed *constantly* — the three laws, tokens, banned patterns. Everything else lives in `docs/` and gets read on demand.

This is also why I **didn't** use `@docs/...` imports in it. Imports pull those files into every request, which converts a well-organised doc set back into one enormous always-loaded prompt.

Related: Claude Code caches the stable prefix of your conversation — system prompt, `CLAUDE.md`, early tool results — and cache hits cost a fraction of fresh tokens. **Editing `CLAUDE.md` mid-session invalidates that cache** and you pay full price to rebuild it. Change it at session boundaries. Long idle gaps also expire the cache, so a session you walked away from for an hour restarts cold. **(verify — caching behaviour is an implementation detail)**

### 4. Plan before you let it edit

Plan mode makes the model investigate and propose without touching files. Cycle into it with **Shift+Tab** **(verify)**. For anything structural — the trace chart, the schema, the auth middleware — plan first, read the plan, correct it, *then* let it build.

Reviewing a wrong plan costs a few hundred tokens. Reviewing wrong code costs the generation, your reading time, and the rewrite. **Rework is the dominant cost on a project this size, and planning is how you avoid it.**

### 5. Name exact paths

"Fix the chart" triggers a search across the repo. "In `components/sections/Trace.tsx`, the bars don't respect `prefers-reduced-motion`" goes straight to the file. Same outcome, a fraction of the tokens, and a more precise fix.

If you don't know the path, `/clear` first and ask it to locate the file as its own cheap question.

### 6. Delegate exploration to subagents

"Find every place a raw hex value is used instead of a token" is a search that produces a lot of noise. A subagent runs that search in **its own context** and hands back only the conclusion — your session never sees the file dumps.

Define reusable ones in `.claude/agents/*.md` with `name`, `description`, and `tools` frontmatter **(verify)**. Good candidates here: an auditor that checks for hardcoded strings violating law #1, and one that verifies RLS is enabled on every table.

### 7. Don't paste files — let it read them

Pasting a 400-line file puts it in the conversation permanently. Asking it to read `components/sections/Trace.tsx` puts it in a tool result that compaction can later drop. Same information, better lifecycle.

### 8. Screenshot instead of describing

For a visual bug, a screenshot ends the conversation in one turn. Describing it in words usually takes three or four rounds of guessing. A picture really is cheaper than a thousand tokens of back-and-forth about why the spacing looks wrong.

### 9. Switch models for mechanical work

`/model`. Phase 2 of the roadmap — S11 through S14 — is repetitive CRUD forms against a schema that's already proven. That doesn't need the strongest model. Architecture, the trace chart, and the RLS policies do.

### 10. Trim your MCP servers

Every connected MCP server's tool definitions ship with every request. If you have servers connected that this project doesn't use, disconnect them for the duration. Check with `/mcp` **(verify)**.

### 11. Keep it out of the noise

Don't let it read `node_modules`, `.next`, or lockfiles. I'm **not confident `.claudeignore` is a real mechanism** — I believe the actual control is a `permissions.deny` list in `.claude/settings.json` with `Read` patterns. Check `/config` or the docs rather than trusting me here. **(verify)**

---

## 3. Custom slash commands worth creating

Drop markdown files in `.claude/commands/`. The filename becomes the command. Frontmatter supports `description` and `argument-hint`; `$ARGUMENTS` interpolates what the user typed **(verify)**.

`.claude/commands/check.md` — the done-check, used constantly:

```markdown
---
description: Verify the build is actually clean
---
Run `npx tsc --noEmit` and `npm run build`. Report every error with its
file and line. Fix them. Do not report success unless both commands exit 0.
```

`.claude/commands/section.md`:

```markdown
---
description: Build a public site section to spec
argument-hint: [section name]
---
Read docs/02-design-direction.md. Build the $ARGUMENTS section.
All strings through t(). Tailwind theme tokens only, never raw hex.
No banned patterns from CLAUDE.md. Ship the prefers-reduced-motion
branch alongside any animation. Then screenshot it and critique
your own work before telling me it's done.
```

`.claude/commands/audit.md`:

```markdown
---
description: Check the three laws are being followed
---
Use a subagent. Report only violations, with file and line:
1. User-facing string literals in JSX that bypass t()
2. Tables without RLS enabled, or missing a public-read policy
3. SUPABASE_SERVICE_ROLE_KEY reachable from any 'use client' file
4. Raw hex values instead of theme tokens
5. Any banned pattern from CLAUDE.md
```

Run `/audit` at the end of each phase. It catches drift early, when it's cheap.

---

## 4. Session hygiene

Open each session by stating the goal and the constraint, then let it work:

> S5 from docs/04-build-roadmap.md. Read that row and docs/02-design-direction.md §3 first. Plan before editing.

Close each session by actually verifying:

> /check

Then `/clear`.

**Never trust "done" without a build.** The most expensive failure mode on a project this size is accumulating three sessions of work on top of a type error from session one.

---

## 5. Useful CLI flags

`claude --continue` resumes the most recent session. `claude --resume` lets you pick one. `--model` sets the model for the run. `-p "..."` runs a single prompt non-interactively and exits — handy for scripted checks. `--add-dir` grants access to an extra directory. **(verify — flag names and behaviour)**

Avoid `--dangerously-skip-permissions` on a project holding a service role key. The permission prompts are the thing standing between a confused edit and your production database.

---

## 6. What actually wastes tokens

In rough order of how much money they cost on a real project:

**Rework from unclear direction.** You've already avoided the big one — the design and schema are decided, written down, and enforced by `CLAUDE.md`. Building a work section twice because the aesthetic was undecided costs more than a hundred careless prompts.

**Marathon sessions.** Covered above. This is the mechanical cost multiplier.

**Vague prompts that trigger exploration.** Every "something's broken somewhere" is a repo-wide search.

**Asking for work you don't want.** Unrequested tests, README files, and summary documents. `CLAUDE.md` tells it not to generate these; most people never do that and then pay for them every session.

**Re-explaining decisions.** If you find yourself saying the same thing in a third session, it belongs in `CLAUDE.md` or a `docs/` file. That's the whole point of them.

**Debugging by conversation.** Four rounds of "try this?" costs more than one screenshot or one pasted error message.

---

## 7. The short version

Read the roadmap row. Plan mode. Let it build. `/check`. `/clear`. Repeat fifteen times.

The documents in `docs/` exist so that you never have to re-explain this project to a fresh session — which is what makes clearing cheap, and clearing is what makes the whole thing affordable.
