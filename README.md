# Bexley Publishing — Children's Book Illustration Landing Page

Standalone Next.js 15 (App Router) project for the children's book landing page.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start   # production
```

Node.js 18.18+ is required (20 LTS recommended).

## Pages

| Route             | File                                              |
|-------------------|---------------------------------------------------|
| `/`               | `app/page.tsx` → `components/pages/landing/ChildLandingPage.tsx` |
| `/thank-you`      | `app/thank-you/page.tsx` (form redirects here, not indexed by Google) |
| `/terms-of-use`   | `app/terms-of-use/page.tsx`                       |
| `/privacy-policy` | `app/privacy-policy/page.tsx`                     |
| `/refund-policy`  | `app/refund-policy/page.tsx`                      |

## Before going live

1. **Copy images** from your main site into `public/images/` (same folder structure):
   - `Bexley-Publishing-03.png` (logo)
   - `page/child-banner-vec-img3.png`, `page/child-banner-vec-img4.png` (hero)
   - `page/e-bok-inner-img.png` (Who We Are)
   - `page/child-cta-img2.png`, `page/child-cta-img.png` (CTA bands)
   - `page/process-img-m.png` (How It Works)
   - `page/cta-vec-img1.png`, `page/cta-vec-img2.png` (final CTA)
   - `page/popup-img.png` (Get Started popup)
   - `children/portfolio/children-1.webp` … (portfolio — see the `portfolio` constant)
   - `favicon.ico` in `public/`

   Missing images show a striped placeholder instead of breaking the page.
2. **Legal pages:** replace the `[Your text here]` placeholders with your real policy text.
3. **Live chat:** paste your LiveChat script into `app/layout.tsx` (marked with a comment).
4. **Contact details** appear in two places: `BRAND` at the top of `ChildLandingPage.tsx` and `components/site.ts`.
5. Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) to the domain you deploy to.

## Deploy

Push to GitHub and import into Vercel (zero config), or run `npm run build && npm start` on any Node host.
