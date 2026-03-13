
# RubyIA — Private Quotation Site (Excel → PDF, Persistent Selections)

This bundle includes:

- **Catalog with filters** and **persistent selections** across filter changes (`assets/app.js`).
- **Quotation page** where you can **upload your Excel** quote and:
  - **Email as PDF** via a Pages Function (`/api/convert_excel_and_send`).
  - **Download the PDF** (`/api/convert_excel`).
- **Email function** (`/api/send_email`) with **From/Reply‑To** defaults to `lukshikan@rubyia.lk` and override capability.

## Deploy (Cloudflare Pages)
1. Connect this folder to Cloudflare Pages (or upload via GitHub).  
   Build command: *(blank)*, Output dir: `/`
2. Set environment variables (Pages → Project → **Settings → Environment variables**):
   - `SENDGRID_API_KEY` — Twilio SendGrid Email API key.
   - `API2PDF_KEY` — API key for API2PDF (LibreOffice conversion of Excel → PDF).
3. Deploy; visit `/pages/quote.html` to test the Excel → PDF features.

> **Why API2PDF?** Cloudflare's Browser Rendering is for **HTML/URL → PDF**; to convert **Excel → PDF** we call a conversion API (LibreOffice behind the scenes). See: Cloudflare docs on Browser Rendering PDF, and API2PDF guide for Workers.  

## Make the site private (Email + One‑Time PIN)
Use **Cloudflare Access** to protect the site with identity rules (email, OTP).
- Zero Trust → **Access** → **Applications** → **Add application** → *Self‑hosted*  
- Application domain: your `*.pages.dev` (or custom domain)  
- Policy: **Include** → Emails or Email domain (`rubyia.lk`) → **Authentication** = *One‑Time PIN (OTP)*  
- Save and test in an incognito window.

## Notes
- After **SendGrid Domain Authentication** (SPF/DKIM) is complete, you can send from **any `@rubyia.lk` address** and enjoy better deliverability.  
- The catalog's **temporary selections persist** across filters in `localStorage` key `enquiry_selected`. The enquiry **cart** persists in `enquiry_cart`.

