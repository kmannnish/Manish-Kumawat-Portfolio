-- ============================================================
-- 0001_enums.sql
-- All PostgreSQL enums. Must run before any table that references them.
-- ============================================================

create type publish_status    as enum ('draft', 'published', 'archived');
create type section_kind      as enum ('hero', 'trace', 'work', 'design', 'writing', 'skills', 'about', 'testimonials', 'contact', 'custom');
create type media_kind        as enum ('image', 'video', 'audio', 'poster', 'print', 'stage', 'mockup');
create type submission_status  as enum ('new', 'read', 'replied', 'archived', 'spam');
