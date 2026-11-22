# Therapeak Chiropractic — website

Static, single-page website for **Therapeak Chiropractic LLC** (Dr. Jay Ryu, DC), 15 S. Grady Way, Suite 510, Renton, WA 98057.
Built to be hosted free on **GitHub Pages** at **https://therapeakchiro.com**.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, auto injury & PIP, services, about, FAQ, location, appointment form, footer. Includes SEO meta, Open Graph tags and JSON-LD (Chiropractor + FAQPage). |
| `styles.css` | All styling. Design tokens at the top (`:root`), mobile-first breakpoints at the bottom. |
| `assets/site.js` | Small progressive-enhancement script: mobile menu, header shadow, appointment form (mailto draft + copy), footer year. |
| `assets/hero-clinic-*.jpg`, `assets/spine-model-*.jpg` | Hero and about-section photos (AI-generated placeholders — replace with real clinic photos when available; keep the file names). |
| `assets/og-image.jpg` | 1200×630 social preview image. |
| `assets/logo-mark.png`, `assets/logo-mark-light.png` | The Therapeak logo mark on a transparent background — the light version is re-coloured for the dark footer. Used in the header and footer lockups. |
| `assets/logo-full.png`, `assets/logo-full-light.png` | The full stacked logo (mark + wordmark), transparent, for social profiles, print and the JSON-LD `logo` URL. |
| `assets/icon-16.png` … `icon-512.png`, `favicon.ico` | Favicon and app icons drawn from the mark (paper background so they read on any tab bar). |
| `CNAME` | `therapeakchiro.com` — tells GitHub Pages which domain to serve. |
| `404.html` | Friendly not-found page. |
| `robots.txt`, `sitemap.xml` | Search engine basics. |
| `.nojekyll` | Serve files as-is (no Jekyll processing). |

All asset paths are **relative**, so the site works at both `therapeakchiro.com/` and a project subpath such as `username.github.io/therapeakchiro/`.

## Deploy to GitHub Pages

1. Create a new **public** repository, e.g. `therapeakchiro` (any name works).
2. Upload everything in this folder to the repository root — including `CNAME` and `.nojekyll` — and commit to `main`.
3. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / folder: `/ (root)` → Save.**
4. Under **Custom domain**, enter `therapeakchiro.com` and save (this matches the `CNAME` file). Wait for the DNS check to pass, then tick **Enforce HTTPS**.
5. At the domain registrar, point the apex domain at GitHub Pages:
   - `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `AAAA` records for `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - `CNAME` record for `www` → `<your-github-username>.github.io`
6. DNS can take from a few minutes up to 24 hours. The site also stays reachable at `https://<username>.github.io/<repo>/` in the meantime.

## Editing content

- **Phone / email / address:** search `index.html` for `524-3602`, `therapeakchiro@gmail.com`, `Grady Way`. Each appears in the header, hero, contact card, form text, footer and JSON-LD — update all of them.
- **Hours:** the site says "By appointment" throughout (hero badge, contact card, footer). Do not add specific hours unless the clinic adopts them.
- **Services / FAQ:** each is a self-contained block; the FAQ answers are also duplicated in the `FAQPage` JSON-LD near the top of `index.html` — keep the two in sync.
- **Brand:** the logo images are supplied artwork — replace `assets/logo-*.png` and re-run any icon export if the logo changes. The header wordmark is live text (`THERAPEAK` / `CHIROPRACTIC` in Inter 800), so keep it in step with the artwork.
- **Colours and type:** the `:root` block at the top of `styles.css` (navy `--ink`, off-white `--paper`, muted teal `--teal`, sage `--sage`).

## How the appointment form works

GitHub Pages is static, so there is no server. The form:

1. Checks the three required fields (name, phone, email).
2. Builds a formatted message and opens the visitor's own email app addressed to `therapeakchiro@gmail.com` (`mailto:` draft). Nothing is sent until they press send.
3. **Copy details** copies the same message to the clipboard for visitors whose browser or phone has no mail app configured.

No data is stored on the site. If online booking is added later (Jane, Calendly, etc.), replace the form with a button that embeds or links to the scheduler.

## SEO checklist after launch

- Submit `https://therapeakchiro.com/sitemap.xml` in Google Search Console.
- Create/claim a Google Business Profile for the Renton office and set the website field to `https://therapeakchiro.com`.
- Update the JSON-LD if the clinic gets a public listing URL or Google Place ID (they can be added as `sameAs`).
