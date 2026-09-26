import type { Template } from "@/types";

export const TEMPLATES: Template[] = [
  {
    id: "readme",
    name: "README Template",
    description: "Project intro, install, usage and license sections.",
    content: `# Project Name

> One sentence describing what this project does and who it is for.

## ✨ Features

- Feature one
- Feature two
- Feature three

## 🚀 Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## 📖 Usage

\`\`\`ts
import { doThing } from "project-name";

doThing({ verbose: true });
\`\`\`

## 🧪 Testing

\`\`\`bash
npm test
\`\`\`

| Script | Purpose |
| ------ | ------- |
| \`dev\` | Start local server |
| \`build\` | Production build |
| \`lint\` | Static analysis |

## 🤝 Contributing

Contributions, issues and feature requests are welcome.

## 📄 License

Distributed under the MIT License.
`,
  },
  {
    id: "blog",
    name: "Blog Post Template",
    description: "Title, hero quote, sections and takeaways.",
    content: `# Your Article Title

*Published by **Author Name** — 5 min read*

> A compelling opening quote or thesis statement that hooks the reader.

## Introduction

Set up the problem and why the reader should care.

## The Deep Dive

Explain your topic with supporting detail:

1. First key point
2. Second key point
3. Third key point

### A Subsection

- Bullet with **bold emphasis**
- Bullet with \`inline code\`
- Bullet with a [link](https://example.com)

## Code Example

\`\`\`python
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("world"))
\`\`\`

## Conclusion

Summarize the takeaways in a short paragraph.

---

*Thanks for reading! Follow for more articles.*
`,
  },
  {
    id: "meeting",
    name: "Meeting Notes Template",
    description: "Agenda, attendees, decisions and action items.",
    content: `# Meeting Notes — Weekly Sync

**Date:** 2026-01-01
**Location:** Zoom
**Attendees:** Alice, Bob, Carol

## 🎯 Agenda

- Sprint review
- Roadmap adjustments
- Blockers

## 🗒️ Discussion

### Sprint Review

- Shipped the PDF export feature ✅
- Dark mode polish in progress 🚧

### Blockers

| Item | Owner | Status |
| ---- | ----- | ------ |
| API rate limits | Bob | Open |
| Design QA | Carol | In review |

## ✅ Decisions

1. Freeze scope for v1.2 on Friday.
2. Move the retro to next Wednesday.

## 📌 Action Items

- [ ] Alice: update release checklist
- [ ] Bob: investigate rate limit workaround
- [x] Carol: share final mockups

## ⏭️ Next Meeting

Monday 10:00 — demo day prep.
`,
  },
  {
    id: "project-docs",
    name: "Project Documentation",
    description: "Overview, architecture, setup and FAQ.",
    content: `# Product Documentation

## Overview

Describe the product, its goals and target audience.

## Architecture

\`\`\`text
Client (Next.js) → Edge Functions → Database
                                  ↘ Cache (Redis)
\`\`\`

### Components

- **Web App** — user-facing UI
- **API Layer** — request validation & business logic
- **Storage** — object store + relational database

## Setup

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10

### Installation

\`\`\`bash
git clone https://github.com/acme/product.git
cd product
cp .env.example .env
npm install && npm run dev
\`\`\`

## Configuration

| Variable | Default | Description |
| -------- | ------- | ----------- |
| \`PORT\` | 3000 | HTTP port |
| \`LOG_LEVEL\` | info | Verbosity |

## FAQ

**Q: How do I reset the database?**

A: Run \`npm run db:reset\`.

> Note: this destroys all local data.
`,
  },
  {
    id: "technical-doc",
    name: "Technical Documentation",
    description: "API reference with endpoints, params and examples.",
    content: `# API Reference

Base URL: \`https://api.example.com/v1\`

## Authentication

All requests require a bearer token:

\`\`\`bash
curl -H "Authorization: Bearer $TOKEN" \\
  https://api.example.com/v1/documents
\`\`\`

## Endpoints

### List documents

\`GET /documents\`

#### Query parameters

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| \`limit\` | number | no | Page size (max 100) |
| \`cursor\` | string | no | Pagination cursor |

#### Example response

\`\`\`json
{
  "data": [
    { "id": "doc_123", "title": "Hello", "format": "markdown" }
  ],
  "next_cursor": null
}
\`\`\`

### Convert document

\`POST /documents/:id/export\`

\`\`\`ts
const res = await fetch("/v1/documents/doc_123/export", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ format: "pdf", margin: 10 }),
});
\`\`\`

## Errors

- \`400\` — Invalid request body
- \`401\` — Missing or expired token
- \`429\` — Rate limited; retry after backoff

> All timestamps are ISO-8601 in UTC.
`,
  },
];
