# Mobile Massage website

Next.js (App Router, TypeScript) site with a custom-built CMS. No third-party CMS or database.

## Run it

```bash
npm install
cp .env.example .env.local   # then set ADMIN_PASSWORD and SESSION_SECRET
npm run dev
```

- Site: http://localhost:3000
- CMS: http://localhost:3000/admin

In development, if `.env.local` is missing, the CMS password is `change-me-now`. In production the CMS refuses to sign anyone in until `ADMIN_PASSWORD` and `SESSION_SECRET` are set.

## How the CMS works

- **Schema-driven.** Each editable document (Home page, Site settings) is described once in `src/lib/cms/schemas.ts`. The admin editor builds its forms from that description, and the server uses the same description to validate and clean everything that is saved (links must be safe, lists are capped, unknown fields are dropped).
- **Draft and publish.** Edits save as a draft. "Preview draft" shows the site with draft content (only for signed-in editors). "Publish" makes it live.
- **Version history.** The last 15 published versions are kept and can be loaded back as a draft.
- **Section switches.** Every home page section has a "Show this section" switch. Client reviews start switched off because the starter text is a placeholder.
- **Image upload.** Uploads are stored in `content/uploads` and served from `/media/...`.
- **Auth.** Password sign-in, signed httpOnly session cookie (12 hours), login rate limiting, same-origin checks on every change.

Content lives in `content/published/*.json` and `content/draft/*.json`. Set `CMS_DATA_DIR` to store it somewhere else (for example a mounted volume).

## About page

Edit it at `/admin/about`. It has an introduction with a main photo, your story, "what to expect", a therapist profile, qualifications, and where you work. The therapist profile and qualifications stay hidden until you add a real name, bio or qualification, so nothing is shown that you have not written. Towns listed under Site settings, Search and social appear as chips in "Where I work". The page is in the sitemap and carries its own structured data (About page, breadcrumbs and, once you add a name, the therapist).

## Site pages

| Page | Address | Edit in the CMS |
| --- | --- | --- |
| Home | `/` | Home page |
| About us | `/about` | About us page |
| Collection | `/collection` | Collection page |
| Gallery | `/gallery` | Gallery page |
| Insights | `/insights` | Insights page |
| Contact us | `/contact` | Contact page |

Menu, footer, phone and WhatsApp number are under **Site settings**. The starter menu links to all six pages; if you previously customized the menu, add Gallery or Insights there if you want visitors to see those links.

**Insights.** Add and edit guides in `/admin/insights`. Articles support drafts, scheduled publish dates, summaries, cover images, categories, and basic Markdown. Published articles appear at `/insights`, have individual pages, and are included in the RSS feed and sitemap.

**Gallery page.** Manage the standalone photo and video gallery in `/admin/gallery`. It shares the media library with the home and collection pages.

**Collection page.** Your treatment menu, grouped (for example Relax, Release, Complete). Each treatment has a description, "good for" points, lengths and prices (one per line, like `60 minutes | RWF 30,000`) and an optional photo. Every Book button opens WhatsApp with the treatment already written in. Below the menu is the **photo gallery**: photos, uploaded videos or YouTube/Vimeo links, opened large in a full-screen viewer (arrow keys, swipe, Escape). Give every photo a description for search and screen readers; the gallery stays hidden until you add something. The Home page has its own smaller gallery section.

**Contact page.** A booking form that builds a WhatsApp message (nothing is stored or sent to a server), your phone and WhatsApp, and the areas you serve.

## Photos and videos

- **Media library** (`/admin/media`): upload several files at once, see where each is used, copy its address, delete unused files. A file used on any page (live or draft) cannot be deleted.
- **Pick from anywhere:** every photo or video field in the editor has Upload and Library buttons.
- **Limits:** photos 8 MB (JPG, PNG, WebP, AVIF), videos 50 MB (MP4, WebM). Set in `src/lib/cms/media.ts`. File contents are checked, not just the file name. If you host behind nginx, raise `client_max_body_size` to at least 60m.
- **Where they appear:** the hero (photo, plus an optional silent looping video), and the "Photos and videos" gallery section, which opens photos large and plays uploaded videos in place. For longer videos, paste a YouTube or Vimeo link into a gallery item.
- Videos stream with range requests, so they start quickly and can be skipped through.

## Search engine optimisation

Built in:

- Page title, description, canonical link, Open Graph and X (Twitter) share cards, all editable per page, with live length guides.
- `/sitemap.xml` (includes photos and uploaded videos) and `/robots.txt`. Admin, API and preview links are kept out of search.
- Structured data (JSON-LD): business, website, treatments, FAQ and uploaded videos. Only facts that are in the CMS are included; nothing is invented.
- One `h1`, a clean heading outline, descriptions (alt text) for every photo, favicon, fast-loading images.
- **Search readiness** checklist on the CMS dashboard.

To switch it on in production:

1. Set the website address in the CMS (Site settings, Search and social) or the `SITE_URL` environment variable. Without it, canonical links, share previews and the sitemap are skipped on purpose.
2. List the towns and areas you serve, add a 1200 x 630 share image, and describe every photo.
3. Add the site in Google Search Console, paste its verification code in the CMS, and submit `https://your-domain/sitemap.xml`.
4. Create a free Google Business Profile as a service-area business and ask clients for reviews. For a local business this matters more than anything in the code.

## Keeping content and schema in step

`npx tsx scripts/check-content.ts` confirms the starter content matches the CMS schema. Run it after changing either one. It catches shape mistakes before they reach the browser.

## Adding the next pages

1. Add the content types and starter content to `src/lib/cms/defaults.ts`.
2. Add a `DocDef` in `src/lib/cms/schemas.ts` and register it in `DOCS`.
3. Build `src/app/<page>/page.tsx` using `getDoc('<key>')`.

The page then appears in the CMS automatically.

## Hosting note

The store writes to the file system, so host on a server or container with a persistent disk (a VPS, Fly.io, Railway, Render with a disk). On serverless hosts such as Vercel, replace the functions in `src/lib/cms/store.ts` with a database or object storage version. Nothing else needs to change.

## Deploying to the VPS (GitHub Actions + PM2 + Caddy)

The `Build and deploy` workflow builds the standalone Next.js app on GitHub (so the VPS spends no memory on builds) and uploads it to the VPS as a new release. A push to `main` deploys automatically; it can also be started from the Actions tab.

Server layout:

| Path | What |
| --- | --- |
| `/var/www/mobile-massage/current` | Link to the running release |
| `/var/www/mobile-massage/releases/` | Last 3 releases (for quick rollback) |
| `/var/www/mobile-massage/shared/content` | CMS pages, drafts, history and uploads. Never deleted by deploys. Back this up. |
| `/var/www/mobile-massage/.env` | Site secrets (not in git, not in GitHub) |

The app runs under PM2 as `mobile-massage` on `127.0.0.1:3030`, and Caddy serves it over HTTPS. Config files: `deploy/ecosystem.config.cjs` and `deploy/Caddyfile.mobile-massage`.

`.env` on the VPS:

```bash
ADMIN_PASSWORD=use-a-long-unique-password
SESSION_SECRET=output-of-openssl-rand-hex-32
CMS_DATA_DIR=/var/www/mobile-massage/shared/content
SITE_URL=https://massagehome.zamukapos.io
```

Repository secrets (Settings → Secrets and variables → Actions): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.

Rollback: `ln -sfn releases/<older-release> /var/www/mobile-massage/current && pm2 reload mobile-massage`.
