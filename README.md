
RubyIA — Fixes bundle

- Removes legacy **Email via Serverless (HTML attached)** button via CSS and by not including it in the new page.
- **PDF passthrough**: uploading a PDF skips conversion and emails the file unchanged.
- **Persistent selections** are kept across dropdown changes; Select Mode is ON by default.

Functions used
- /api/convert_excel           (Excel -> PDF)
- /api/convert_excel_and_send  (Excel -> PDF -> email)
- /api/pdf_passthrough_and_send (PDF -> email)

Env vars (Pages → Settings → Environment variables)
- SENDGRID_API_KEY (required)
- API2PDF_KEY (only needed for Excel conversion)
