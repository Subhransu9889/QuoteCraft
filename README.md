# QuoteCraft

Automated BOQ and Vendor Quote Comparison app. This repository contains the MVP front-end that lets you:
- Upload a BOQ (Bill of Quantities) spreadsheet
- Upload one or more vendor quotation spreadsheets
- Automatically match quote lines to BOQ items (fuzzy text match)
- Review matches, adjust selections, and compare vendors per line item
- View a simple dashboard with basic KPIs (items, vendors, coverage, totals)
- Approve your selections to generate a summary file
- Export an updated BOQ with your selected vendor and rate per item

This MVP aligns with the QuoteCraft-MVP plan and prepares the project to integrate with IBM watsonx Orchestrate for extraction, policy routing, and ERP updates.

Links:
- MVP spec: ./QuoteCraft-MVP.md
- Code of Conduct: ./CODE_OF_CONDUCT.md
- Contributing guide: ./CONTRIBUTING.md
- License: ./LICENSE (MIT)


## Status and Scope
This is the front-end MVP. It focuses on the core user journey end-to-end on the client:
1) Upload BOQ file
2) Upload vendor quotes
3) Auto-match (fuzzy matching in-browser)
4) Dashboard (basic KPIs)
5) Compare and choose winning vendors per BOQ line
6) Approval (generate summary)
7) Export the decision back to a spreadsheet

What’s intentionally out of scope for this MVP (planned for next milestones):
- Server-side ingestion and OCR/structuring of PDFs
- Policy routing and approvals via watsonx Orchestrate
- ERP integrations (PR/PO creation, attachments, notifications)


## Features
- Multi-file upload UI for BOQ and vendor quotes
- Client-side parsing of XLSX using the xlsx library
- Fuzzy matching powered by Fuse.js (placeholder for LLM-based matching)
- Interactive comparison table to select vendors per line
- Export of updated BOQ with chosen rates
- Modern React + TypeScript + Tailwind UI using shadcn components


## Tech Stack
- React 18, Vite, TypeScript
- Tailwind CSS + shadcn/ui components
- Fuse.js for fuzzy matching
- xlsx for spreadsheet parsing
- React Router for pages


## Getting Started
Prerequisites
- Node.js 18+ (or Bun if you prefer)

Install dependencies
- npm: npm install
- pnpm: pnpm install
- yarn: yarn install
- bun: bun install

Run the dev server
- npm run dev
- Visit http://localhost:5173

Build for production
- npm run build
- Preview locally: npm run preview

Lint
- npm run lint


## Usage Walkthrough
1) Prepare sample data
   - Create a BOQ file in .xlsx with columns like: Item Number, Description, Unit, Quantity, Base Rate (optional)
   - Create one or more vendor quote files (.xlsx) with columns: Vendor, Description, Unit, Rate, Quantity (optional)
   - You can also experiment with your own spreadsheets that have similar column headers. The uploader lets you map columns during import.

2) Upload BOQ
   - Open the app and go to Step 1: Upload BOQ
   - Drag-drop or select your BOQ .xlsx file and verify the preview

3) Upload Quotes
   - In Step 2, add one or more vendor .xlsx files
   - Each quote is parsed client-side; vendor name can come from the file name or the Vendor column

4) Auto-Match
   - In Step 3, click to run Auto-Match
   - The app uses a FuzzyMatcher (Fuse.js) to propose matches between quote lines and BOQ items and shows a confidence score
   - You can later adjust your final choice in the comparison table

5) Compare & Select
   - Step 4 shows a comparison table by BOQ line
   - For each BOQ item, choose the vendor/rate you want

6) Export
   - Step 5 lets you export an updated BOQ including your chosen vendor and rate per item


## MVP Compliance Notes
This repo implements the UI portions of the MVP plan defined in QuoteCraft-MVP.md:
- Upload BOQ & Quotes (UI): Implemented
- Automatic Extraction & Structuring: Implemented for spreadsheets in-browser; PDF/OCR planned
- Normalized Vendor Comparisons: Implemented basic matching and comparison UI
- Policy-based Routing: Placeholder only; to be orchestrated via watsonx Orchestrate
- ERP Integration: Planned; to be implemented via Orchestrate skills and backend APIs
- Audit & KPI Tracking: Not included in this UI MVP

The code includes a placeholder LLM matcher in src/lib/matching.ts (LLMMatch) for future integration. The default matcher is FuzzyMatcher.


## Project Structure
- index.html, src/main.tsx: Vite app bootstrap
- src/pages/Index.tsx: Main end-to-end flow with 5 steps
- src/components/*: Uploaders, matching control, comparison table, export button
- src/lib/types.ts: Core TypeScript interfaces
- src/lib/matching.ts: Matching providers (FuzzyMatcher default; LLMMatch placeholder)
- public/: Static assets


## Configuration
No environment variables are required for this UI-only MVP. When connecting to a backend and Orchestrate, you will add API URLs and keys via environment files and update the README accordingly.


## Roadmap
Short-term
- Add sample datasets (BOQ and quotes) in /public/sample-data
- Improve column mapping and validation
- Add per-line comments and attachments
- Enhance export with taxes, terms, and totals

Medium-term
- Connect to backend for file storage and sessions
- Integrate watsonx Orchestrate flows for extraction and policy routing
- ERP PR/PO creation, notifications, and audit logs


## Contributing
Please read CONTRIBUTING.md for guidelines. By participating, you agree to follow our CODE_OF_CONDUCT.md.


## License
This project is licensed under the MIT License. See LICENSE (MIT).
