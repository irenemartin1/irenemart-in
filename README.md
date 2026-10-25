# Irene Martin — Technical Systems Portfolio

Personal technical portfolio for Irene Martin (Orlando, FL). Static site, no build step, no runtime dependencies, no external requests (system fonts only).

Kept separate from the M.D. Sky production app and the eBuilt.app marketing site.

## Structure

```
index.html            All page sections (hero → closing)
assets/styles.css     Design system and layout
assets/main.js        Interactions: nav, reveals, layer model, role diagram,
                      booking pipeline, troubleshooting walkthrough
assets/og-image.png   Social sharing image (1200×630)
assets/apple-touch-icon.png
favicon.svg
_headers              Cloudflare Pages security headers (CSP, nosniff, frame-deny)
robots.txt
```

## Run locally

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy — GitHub → Cloudflare Pages

1. Create an empty GitHub repo (e.g. `irenemartin1/portfolio`), then:
   ```bash
   git remote add origin git@github.com:irenemartin1/portfolio.git
   git push -u origin main
   ```
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → select the repo.
3. Build settings: Framework preset **None**, build command **(empty)**, output directory **`/`**.
4. Deploy. Add the custom domain under the Pages project → Custom domains. If the domain's DNS is already on Cloudflare this adds a record only — nameservers are not changed.

The canonical URL and social image URLs in `index.html` point to `https://irenemart.in/`. If the site lives elsewhere, update the `canonical`, `og:url`, `og:image` and `twitter:image` tags.

## Content rules this site follows

- Real case studies are separated from illustrative diagrams and the hypothetical troubleshooting scenario, and each is labeled.
- Project status is stated honestly (live vs. in progress / planned).
- No metrics, certifications, testimonials or enterprise-infrastructure claims that aren't backed by actual work.
- No client data, credentials, internal URLs or screenshots.
