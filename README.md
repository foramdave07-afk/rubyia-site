
RubyIA — Cloudflare Pages bundle (PDF email + pretty URL)

- Catalog: browse all with filters, selection and bulk add
- Quotation: VAT 18% fixed, totals, amount-in-words, serverless email
- Pages Function: /api/send_email (prefers PDF, falls back to HTML attachment)
- Pretty URL: /pages/quote -> redirects to /pages/quote.html

Deploy on Cloudflare Pages (Connect to Git). Build command blank, output directory '/'. Then set SENDGRID_API_KEY in Settings → Environment variables and redeploy.
