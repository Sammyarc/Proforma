# Proforma copy and on-page SEO

Production URL: https://proforma-gen.vercel.app/

## Product positioning

Proforma is an online invoice generator for freelancers, studios, and small businesses. The copy describes branded invoice templates, PDF/PNG/JPG downloads, invoice emails, PayPal payment links, client invoice history, and payment tracking. It states the current USD currency limitation, device-local draft storage, Free's 10 invoice emails per month, and Pro's $108 annual price. It does not promise faster payments, accounting functionality, automated reminders, or unimplemented payment integrations.

Rewritten surfaces include the homepage hero, feature sections, workflow, pricing, FAQs introduction, calls to action, footer, mobile navigation, product previews, authentication, dashboard overview, invoice/payment library, clients, settings, invoice editor, upgrade screens, and result pages. Clear functional labels and accurate existing instructions remain intact. The dashboard header date has been removed.

## Search implementation

- Homepage title and description identify the invoice generator and its audience; the page has a single main heading and descriptive feature headings.
- Homepage canonical URL, Open Graph/Twitter metadata, and factual SoftwareApplication structured data are in `frontend/index.html`.
- `PageMetadata.jsx` updates titles and descriptions on route changes. Only the public homepage is indexable. Account, dashboard, billing, payment, and unknown routes receive noindex; reset tokens and payment query parameters are excluded from canonical/social URLs.
- Vercel X-Robots-Tag headers also mark known private/transactional routes noindex before JavaScript runs. Authentication remains the access control; robots directives are not security controls.
- `public/sitemap.xml` lists the public homepage. `/pricing` remains authenticated, so pricing content is indexed through the homepage's pricing section instead.
- `public/robots.txt` advertises the sitemap and permits crawling so crawlers can see noindex directives.
- The application remains client-rendered. Homepage metadata is present in the initial HTML; page content requires JavaScript rendering. This change does not introduce server rendering or guarantee search rankings/rich results.

Editorial reference: [Google Search Central's SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) and [title-link guidance](https://developers.google.com/search/docs/appearance/title-link).

## Verification and release

Fixture-backed browser checks passed at 320, 390, 768, and 1440 pixels for public, auth, dashboard, editor, and upgrade screens. Checks covered overflow, removed header date, page titles, robots metadata, canonical URLs, structured data, FAQ interaction, and metadata restoration during client-side navigation. No real payments or emails were sent.

After deployment, submit `https://proforma-gen.vercel.app/sitemap.xml` in the site's Google Search Console property and inspect the deployed homepage. Deployment and Search Console submission were not performed in this task.
