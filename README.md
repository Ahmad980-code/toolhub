<div align="center">

# ToolHub

**33 free, fast and private online tools: calculators, converters, image & PDF tools, and tools built for Pakistan.**

Everything runs in the browser. No sign-up, no uploads, no waiting.

### 🌐 Live site: **[toolhub-eosin.vercel.app](https://toolhub-eosin.vercel.app)**

[![Live site](https://img.shields.io/badge/Live_site-toolhub--eosin.vercel.app-4f46e5?style=for-the-badge&logo=vercel&logoColor=white)](https://toolhub-eosin.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)

</div>

---

## About the project

ToolHub is a collection of everyday web tools designed to be genuinely useful, fast and pleasant to use. It covers
common global needs (percentages, loans, unit conversion, word counting, PDFs, QR codes) and fills a gap for users in
Pakistan with tools such as an **FBR salary tax calculator**, a **NEPRA-based electricity bill estimator**, a
**zakat calculator** in tola and grams, a **CGPA calculator on the COMSATS/HEC scale** and **amounts in words in
lakh and crore** for cheques.

Every tool page is statically pre-rendered for speed and SEO, and every calculation, image conversion and PDF
operation happens on the visitor's own device: files are never uploaded. A built-in, privacy-friendly developer
dashboard shows traffic, per-tool usage, JavaScript errors and bug reports from visitors.

### Highlights

- **33 tools in 9 categories**, each with its own SEO-optimised page, how-to steps and FAQ (with FAQ rich-result
  structured data).
- **Private by design**: no accounts, no uploads; images and PDFs are processed locally with Canvas and `pdf-lib`.
- **Modern, accessible UI**: custom design system, light/dark/system themes with no flash, keyboard navigation,
  `Ctrl/⌘ K` search, and layouts tested at 390 px mobile width.
- **Accurate, verified results**: tax slabs, electricity tariffs and grading scales were researched from official
  sources, and every tool was checked against independently calculated answers in automated browser tests.
- **Developer dashboard** at `/developer` with traffic history, tool usage, error tracking and bug reports.
- **Ready to monetise**: Google AdSense slots, `ads.txt`, privacy policy and terms pages, sitemap and robots.txt.

---

## The tools

| Category | Tools |
| --- | --- |
| **Everyday Calculators** | Percentage Calculator · Age Calculator · CGPA / GPA Calculator (COMSATS/HEC 4.0 scale) |
| **Finance Calculators** | Loan / EMI Calculator · Compound Interest Calculator · Tip Calculator · Currency Converter (live rates) · Discount & Sales Tax (GST) Calculator · Fuel Cost Calculator |
| **Pakistan Tools** | Salary Tax Calculator Pakistan (FBR 2026-27 slabs) · Zakat Calculator · Electricity Bill Calculator (NEPRA 2026 tariff) · Amount in Words (lakh/crore & million) |
| **Health & Fitness** | BMI Calculator · Calorie Calculator (BMR, TDEE, macros) |
| **Date & Time** | Date Calculator (days between, business days, add/subtract) · Time Zone Converter · Online Stopwatch · Countdown Timer · Pomodoro Timer |
| **Text Tools** | Word Counter · Case Converter · Typing Speed Test |
| **Image & PDF Tools** | Image Compressor · Image Converter (JPG/PNG/WebP) · Merge PDF · Split PDF |
| **Developer & Device Tools** | JSON Formatter & Validator · Base64 Encoder / Decoder · Keyboard Tester (104-key, ghosting test) |
| **Converters & Generators** | Unit Converter · Password Generator · QR Code Generator (URL, Wi-Fi, WhatsApp, email, SMS) |

---

## Technology

| Area | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components, static generation with `generateStaticParams`) |
| UI library | [React 19](https://react.dev) |
| Language | [TypeScript 5](https://www.typescriptlang.org) (strict mode) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) with a token-based design system (CSS custom properties, light & dark themes) |
| Icons | [Lucide](https://lucide.dev) (`lucide-react`) |
| Fonts | Geist & Geist Mono via `next/font` |
| PDF processing | [`pdf-lib`](https://pdf-lib.js.org) (merge & split in the browser) |
| QR codes | [`qrcode`](https://github.com/soldair/node-qrcode) (SVG & PNG output) |
| Images | Canvas API & `createImageBitmap` (compression, conversion, resizing, EXIF orientation) |
| Audio | Web Audio API (timer alarms and chimes, no audio files) |
| Exchange rates | [Exchange Rate API](https://www.exchangerate-api.com) open endpoint |
| Analytics storage | [Upstash Redis](https://upstash.com) over its REST API (production) or a local JSON file (development) |
| SEO | Metadata API, JSON-LD (WebSite, WebApplication, FAQPage, BreadcrumbList), sitemap, robots, Open Graph images (`next/og`) |
| Hosting | [Vercel](https://vercel.com) |
| Code quality | ESLint (`eslint-config-next`), TypeScript type-checking, automated browser tests with Puppeteer during development |

### Languages

| Language | Share | Used for |
| --- | --- | --- |
| TypeScript (TSX) | ~77% (≈11,900 lines, 77 files) | React components, pages and tool interfaces |
| TypeScript | ~23% (≈3,500 lines, 51 files) | Tool logic, content, analytics, server routes |
| CSS | ≈440 lines | Design tokens, themes and base styles (Tailwind CSS v4) |

### Built with AI assistance

ToolHub was designed and developed by the two developers below, working with **Claude Code**, Anthropic's AI coding
agent, powered by the **Claude Opus 5.5** model. The AI was used for planning, writing and reviewing code, researching
tax and tariff data, and running automated browser tests, under the direction and review of the developers.

---

## Developer dashboard

ToolHub includes a private dashboard at **`/developer`** that shows:

- **Traffic history**: daily page views, unique visitors, tool uses and errors (7, 30 or 90 days), with comparison
  to the previous period.
- **Tool usage**: views, uses and use rate for every tool, plus errors and open bug reports per tool.
- **Audience**: traffic sources, countries, devices and browsers.
- **Errors**: JavaScript errors and tool crashes captured automatically in visitors' browsers, grouped by message,
  with stack traces.
- **Bug reports**: messages sent with the "Report a problem" button under each tool, which can be resolved or deleted.

**Privacy:** no cookies are used for analytics, IP addresses are never stored (visitors are counted with a salted,
daily-changing hash), and nothing typed or uploaded into a tool is ever recorded. Bots and headless browsers are
ignored.

**Live dashboard:** [toolhub-eosin.vercel.app/developer](https://toolhub-eosin.vercel.app/developer) (password
required). Access is protected by the `DEVELOPER_PASSWORD` environment variable; on the live site, visits are stored in
Upstash Redis. When running a local copy without a password, the dashboard is open and data is stored in
`.analytics/data.json`.

---

## Run it locally (for development)

> To **use** ToolHub, just open the live site: **[toolhub-eosin.vercel.app](https://toolhub-eosin.vercel.app)**.
> The steps below are only for developers who want to run their own copy on their computer to change the code.

**Requirements:** Node.js 20 or newer and npm.

```bash
git clone https://github.com/Ahmad980-code/toolhub.git
cd toolhub
npm install
npm run dev
```

Your local copy then runs at `http://localhost:3000` (local dashboard: `http://localhost:3000/developer`). These
`localhost` addresses only work on the computer running the command; everyone else uses the live site above.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Create an optimised production build (all tool pages are pre-rendered) |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

### Environment variables

Copy `.env.example` to `.env.local` and fill in what you need. Everything is optional for local development.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Your domain, e.g. `https://toolhub.pk` (used for canonical URLs, sitemap and Open Graph) |
| `NEXT_PUBLIC_SITE_NAME` | Site name (default `ToolHub`) |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Contact address shown in the privacy policy |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | Google AdSense publisher ID (`ca-pub-…`); also generates `/ads.txt` |
| `NEXT_PUBLIC_ADSENSE_SLOT` | AdSense ad unit ID for the in-page ad slots |
| `DEVELOPER_PASSWORD` | Password for the `/developer` dashboard (required in production) |
| `NEXT_PUBLIC_DEV_SHORTCUT` | Optional secret word that opens the dashboard when typed anywhere on the site |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Upstash Redis credentials for analytics (added automatically by Vercel's Upstash integration) |
| `ANALYTICS_SALT` | Optional secret used when hashing visitor IDs |

---

## Deployment (Vercel)

1. Import the GitHub repository in [Vercel](https://vercel.com/new) (framework: Next.js, no extra settings needed).
2. In **Storage**, add **Upstash for Redis** (free tier) and connect it to the project. This adds the `KV_REST_API_*`
   variables.
3. In **Settings → Environment Variables**, add `DEVELOPER_PASSWORD` and `NEXT_PUBLIC_SITE_URL` (your domain).
4. Deploy, then add your custom domain under **Settings → Domains**.
5. After AdSense approval, add `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` and redeploy.

---

## Project structure

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home: hero search, category tiles, tool directory
│   ├── tools/[slug]/         # One statically generated page per tool (+ OG image, error boundary)
│   ├── developer/            # Private analytics dashboard
│   ├── api/track/            # Collects anonymous page views, tool uses, errors and bug reports
│   ├── api/developer/        # Dashboard login and actions
│   ├── about, contact, privacy, terms
│   ├── sitemap.ts, robots.ts, ads.txt/
│   └── layout.tsx, globals.css   # Theme, fonts, design tokens
├── components/
│   ├── ui.tsx, ui-styles.ts  # Design-system primitives (inputs, buttons, result cards, tables…)
│   ├── tools/                # The 33 interactive tools + shared helpers per tool family
│   ├── home/                 # Home page sections
│   ├── developer/            # Dashboard charts and lists
│   └── analytics/            # Tracker, tool-usage detector, "Report a problem" form
└── lib/
    ├── tools.ts              # Tool registry and categories
    ├── tool-content/         # SEO content (title, description, steps, FAQs) per tool
    ├── analytics/            # Storage (Upstash Redis / local file), auth, aggregation
    ├── site.ts               # Site name, URL, contact and AdSense settings
    └── team.ts               # Developer credits
```

### Adding a new tool

1. Create the interactive component in `src/components/tools/<slug>.tsx` (a client component with no props).
2. Add its content (title, description, intro, steps, FAQs, icon, category) in `src/lib/tool-content/<slug>.ts`.
3. Register it in `src/lib/tool-content/index.ts` and `src/components/tools/index.ts`.

The page, metadata, structured data, sitemap entry, navigation and home-page listing are generated automatically.

---

## Data sources

Some tools rely on figures that change over time. Review them after each federal budget or tariff notification.

| Tool | Source |
| --- | --- |
| Salary Tax Calculator Pakistan | Finance Act 2026 (tax year 2027) and Finance Act 2025 (tax year 2026) salaried-individual slabs |
| Electricity Bill Calculator | NEPRA uniform domestic tariff, S.R.O. 279(I)/2026, effective 12 February 2026 (all rates editable in the tool) |
| CGPA Calculator | COMSATS University Islamabad / HEC absolute grading criteria (Fall 2021 onwards) |
| Zakat Calculator | Nisab of 612.36 g (52.5 tola) silver or 87.48 g (7.5 tola) gold; 1 tola = 11.664 g; rate 2.5% |
| Currency Converter | Live mid-market rates from Exchange Rate API, updated daily |

Results are estimates for general information and are not financial, tax, legal or medical advice.

---

## Developers

Co-developed by **Ahmad Saleem Awan** and **Muhammad Alam Khan**,
Department of Computer Engineering, **COMSATS University Islamabad, Abbottabad Campus**.

| Developer | Contact |
| --- | --- |
| Ahmad Saleem Awan | [ahmadsaleemawan890@gmail.com](mailto:ahmadsaleemawan890@gmail.com) · [GitHub](https://github.com/Ahmad980-code) |
| Muhammad Alam Khan | [muhammadkhanswati4@gmail.com](mailto:muhammadkhanswati4@gmail.com) |

---

© 2026 Ahmad Saleem Awan & Muhammad Alam Khan. All rights reserved.
