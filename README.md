# Therapeak Chiropractic — website

Static, single-page website for **Therapeak Chiropractic LLC** (Dr. Jay Ryu, DC), 15 S. Grady Way, Suite 510, Renton, WA 98057.
Built to be hosted free on **GitHub Pages** at **https://therapeakchiro.com**.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole site: hero, auto injury & PIP, services, about, FAQ, location, appointment form, footer. Includes SEO meta, Open Graph tags and JSON-LD (Chiropractor + FAQPage). |
| `styles.css` | All styling. Design tokens at the top (`:root`), mobile-first breakpoints at the bottom. |
| `assets/site.js` | Small progressive-enhancement script: mobile menu, header shadow, appointment form (AJAX send through FormSubmit, with copy fallback), footer year. |
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

GitHub Pages is static, so there is no server. The form sends its request through **FormSubmit**, a free form-to-email service, which forwards it to `therapeakchiro@gmail.com`:

1. Checks the three required fields (name, phone, email).
2. Sends an AJAX `POST` to `https://formsubmit.co/ajax/therapeakchiro@gmail.com` with the form fields plus `_subject`, `_template=table`, `_captcha=false` and `_replyto` set to the visitor's own email, so replying to the notification goes straight back to them. The body is URL-encoded on purpose: a JSON body would trigger a CORS preflight that FormSubmit does not answer, and every send would fail.
3. Shows **Sending...** on the button, then the confirmation line "Request sent — we'll reply during business hours." and hides the fields.
4. If the send fails (offline, service down), it offers a `mailto:` link with the same message prefilled plus **Copy details**, so the visitor can still reach the clinic.

The hidden `_honey` field is FormSubmit's honeypot: a bot that fills it gets its submission silently dropped.

**FormSubmit activation.** The first submission coming from a given origin gets an "Activate Form" email to `therapeakchiro@gmail.com`; until that link is clicked nothing is forwarded and the form shows its failure fallback. Activation is per origin — `http://therapeakchiro.com` and `https://therapeakchiro.com` each need their own. Both are activated. A new domain, subdomain that is not redirected, or switch of scheme needs its own activation.

**Deliverability.** FormSubmit notifications come from `submissions@formsubmit.co` and Gmail has been filing them under **Spam**, so keep an eye on that folder or add a Gmail filter for that sender (never send to spam, label e.g. "Appointment requests").

No data is stored on the site. If online booking is added later (Jane, Calendly, etc.), replace the form with a button that embeds or links to the scheduler.

## SEO checklist after launch

- Submit `https://therapeakchiro.com/sitemap.xml` in Google Search Console.
- Create/claim a Google Business Profile for the Renton office and set the website field to `https://therapeakchiro.com`.
- Update the JSON-LD if the clinic gets a public listing URL or Google Place ID (they can be added as `sameAs`).
