# Sainteté — Documentation Site Design Spec

**Date:** 2026-04-13  
**Scope:** MkDocs documentation site covering local dev, architecture, content management, and deployment.

---

## Goal

A personal reference site so the developer can set up, develop, and manage the app without re-deriving everything from the code. Not a showcase — lean and practical.

## Audience

Solo developer (godfather). No versioning. No contributor guides.

## Tech Choices

- **MkDocs + Material theme** — Markdown, Python-based, de-facto standard. Dark mode default, `deep-orange` accent.
- **GitHub Pages** — deployed from `gh-pages` branch via GitHub Actions on push to `main`.
- **CI trigger** — only when `docs/**` or `mkdocs.yml` changes, to avoid unnecessary builds on app code changes.

## Doc Structure

```
docs/
├── index.md              # What is this app (1 screen)
├── getting-started.md    # Clone → env → DB → dev server
├── architecture.md       # Stack, auth model, URL structure, key libs
├── data-model.md         # 6 Payload collections, fields, relationships
├── content-management.md # Payload admin: add godchildren, prayers, mysteries in prod
└── deployment.md         # Vercel + Neon setup, env vars, push notification keys
```

`docs/superpowers/` (plans, specs) is excluded from MkDocs nav — internal only.

## README

Short, personal:
- One-line description
- Stack badge row
- 4-command quick start
- Link to full docs on GitHub Pages
