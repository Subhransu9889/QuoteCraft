# QuoteCraft MVP

> **Automated BOQ & Vendor Quote Comparison Agent for Procurement with watsonx Orchestrate**

---

## Overview
QuoteCraft is an AI procurement agent that removes manual BOQ (Bill of Quantities) and vendor quote management by letting users upload files and receive instant, automated vendor comparisons, approvals routed by business policy, and ERP/PR/PO system updates — all orchestrated by IBM watsonx Orchestrate.

### Hackathon Aims
- Eliminate manual data entry & errors in procurement
- Speed up tender processing by up to 50%
- Automate comparison, recommendation, & compliance
- Integrate real systems (email, storage, ERP/API)
- Make everything auditable, secure, and measurable

---

## Core Features
- **Upload BOQ & Quotes**: Accepts multiple file formats for BOQs and vendor quotations via UI or email/folder triggers.
- **Automatic Extraction & Structuring**: Parses files to extract line items, quantities, specs, prices, taxes, terms.
- **Normalized Vendor Comparisons**: Matches vendor quotes to BOQ, normalizes SKUs/specs, highlights deltas, calculates total cost, delivery, compliance.
- **Policy-based Routing**: Checks business rules (thresholds, preferred vendors) and auto-approves or escalates for human approvals.
- **ERP Integration**: Creates/updates Purchase Requests/Orders via ERP/OpenAPI; attaches files, sends notifications.
- **Audit & KPI Tracking**: End-to-end audit logs, exception handling, and dashboards for key metrics (processing time, STP rate, mapping accuracy).

---

## System Architecture

- **Frontend**: Next.js/React with TypeScript. File upload, side-by-side comparison, flagged policies, approvals, status dashboard.
- **Backend**: Node.js/Express. Handles uploads, webhooks, and session tracking; delegates orchestration to watsonx Orchestrate.
- **Orchestration**: watsonx Orchestrate skills/flows for all core logic: document extraction, validation, matching, policy logic, approvals, ERP actions.
- **Skill Studio**: Custom skills (via OpenAPI or built-in connectors) for ERP, storage, email, etc. See [watsonx Orchestrate Skill Studio](https://www.ibm.com/products/watsonx-orchestrate/features)

---

## Tech Stack
- **Frontend**: Next.js/React, Tailwind CSS, React Query, TypeScript
- **Backend**: Node.js, Express, S3 (for storage), REST APIs, JWT Auth (delegated)
- **Orchestrate**: IBM watsonx Orchestrate (Skill Studio, Skill Catalog, Flows)
- **Integrations**: Email (IMAP/SMTP), Storage buckets, ERP (SAP/Oracle via OpenAPI), Slack/Teams notifications

---

## MVP Implementation Plan

### Day 1: Setup & Intake
- Define BOQ/Quote data schema & sample docs
- Set up Orchestrate environment, users
- Build document intake/extraction skill
- Scaffold upload UI (file/drag-drop/email trigger)

### Day 2: Comparison & Routing
- Implement item master & PO lookup skill (OpenAPI)
- Build vendor comparison logic, diff/score engine
- Design policy evaluation skill, handle exceptions/escalation
- Develop frontend comparison & approval views

### Day 3: End-to-End & Demo
- Build ERP PR/PO update skill & notifications
- Integrate flows: upload -> extract -> compare -> approve -> ERP
- End-to-end test with demo data sets
- Track and visualize KPIs; polish assistant chat prompts

---

## Data Model (Example)
- **BOQ**: `{ id, version, items: [{sku, desc, spec, qty, uom}] }`
- **Quote**: `{ vendorId, items: [{sku, unitPrice, minQty, leadTime, tax}], terms }`
- **Comparison**: `{ perItemVariance, totalCost, compliance, score, recommendation, decisionLog }`

---

## IBM Orchestrate Integration Guide
- [Integrations & Connectors Overview](https://www.ibm.com/products/watsonx-orchestrate/integrations)
- [Getting Started with Orchestrate](https://www.ibm.com/docs/en/orchestrate)
- [Building Skills & Skill Flows](https://www.ibm.com/products/watsonx-orchestrate/features)
- [OpenAPI Skill Import How-To](https://www.ibm.com/docs/en/orchestrate/skillstudio)

---

## External References
- [Skill Studio Docs](https://www.ibm.com/products/watsonx-orchestrate/features)
- [What’s New & Release Notes](https://www.ibm.com/products/watsonx-orchestrate/whats-new)
- [Pre-built Procurement Agents](https://www.ibm.com/products/watsonx-orchestrate/ai-agent-for-procurement)

---

## MVP Deliverables Checklist
- [ ] Frontend: File upload, comparison, approval, dashboard
- [ ] Backend: Upload API, webhooks, session manager
- [ ] Orchestration: Extraction, comparison, policy routing, ERP flows
- [ ] Sample data: BOQ/quote example files
- [ ] Demos: Short video/script walkthrough, KPI dashboard
- [ ] Docs: Setup guide, Orchestrate flow exports, README

*Team: QuoteCraft | Project for IBM watsonx Orchestrate Hackathon (2025)*
