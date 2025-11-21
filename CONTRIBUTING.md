# Contributing to QuoteCraft

Thanks for your interest in improving QuoteCraft! This guide explains how to work locally, raise issues/PRs, and follow our standards.

## Quick start
- Fork and clone the repo.
- Create a feature branch: git checkout -b feat/short-description
- Install deps: make install
- Run locally: make dev
- Run tests & lint: make test && make lint
- Commit using Conventional Commits (e.g., feat:, fix:, docs:, chore:, refactor:).
- Open a PR to main with a clear title and checklist below.

## Project layout
- arc-frontend/: Next.js app (upload, compare, approvals)
- backend/: Node/Express API, webhooks, storage, KPI calc
- docs/: Orchestrate setup, skills, flows, ERP sandbox

## Environment
- Copy .env.example to .env and fill in required variables.
- Never commit secrets; prefer connector vaults.

## Code style
- TypeScript strict mode.
- ESLint + Prettier; no unused exports.
- Tests for core logic (parsing, compare, policy).

## PR checklist
- [ ] Description and screenshots of change
- [ ] Updated docs if needed
- [ ] Unit tests added/updated
- [ ] Lint and tests passing
- [ ] No secrets in diffs
